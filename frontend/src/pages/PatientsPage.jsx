import { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Alert from '../components/ui/Alert.jsx';
import { useFeedback } from '../hooks/useFeedback.js';
import { api, getUser, isEditor } from '../lib/api.js';

const emptyPatient = { firstName: '', lastName: '', documentId: '', phone: '', email: '', birthDate: '' };

const fields = {
  firstName: 'Nombre',
  lastName: 'Apellido',
  documentId: 'Documento',
  phone: 'Telefono',
  email: 'Correo electronico',
  birthDate: 'Fecha de nacimiento'
};

export default function PatientsPage() {
  const canEdit = isEditor(getUser());
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyPatient);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const { error, success, loading, clear, run } = useFeedback();

  async function loadPatients(term = search) {
    return run(async () => {
      setPatients(await api(`/patients?search=${encodeURIComponent(term)}`));
    });
  }

  useEffect(() => {
    loadPatients('');
  }, []);

  function resetForm() {
    setForm(emptyPatient);
    setEditingId(null);
    clear();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = Object.fromEntries(Object.keys(emptyPatient).map((key) => [key, form[key]]));
    const wasEditing = Boolean(editingId);

    const saved = await run(async () => {
      const patient = await api(wasEditing ? `/patients/${editingId}` : '/patients', {
        method: wasEditing ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      setPatients(await api(`/patients?search=${encodeURIComponent(search)}`));
      return patient;
    }, wasEditing ? 'Paciente actualizado correctamente.' : 'Paciente creado correctamente.');

    if (!saved) return;

    setForm(emptyPatient);
    setEditingId(null);
  }

  function edit(patient) {
    clear();
    setEditingId(patient.id);
    setForm({
      firstName: patient.firstName,
      lastName: patient.lastName,
      documentId: patient.documentId,
      phone: patient.phone,
      email: patient.email,
      birthDate: patient.birthDate?.slice(0, 10) || ''
    });
  }

  async function remove(id) {
    if (!confirm('Deseas desactivar este paciente?')) return;

    const done = await run(async () => {
      await api(`/patients/${id}`, { method: 'DELETE' });
      setPatients(await api(`/patients?search=${encodeURIComponent(search)}`));
      return true;
    }, 'Paciente desactivado correctamente.');

    if (done && editingId === id) {
      setForm(emptyPatient);
      setEditingId(null);
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    loadPatients();
  }

  return (
    <>
      <PageHeader title="Gestion de pacientes" subtitle="Registro, busqueda y actualizacion de expedientes activos." />
      <Alert tone="error" message={error} onClose={clear} />
      <Alert tone="success" message={success} onClose={clear} />

      <div className={`grid gap-6 ${canEdit ? 'xl:grid-cols-[380px_1fr]' : ''}`}>
        {canEdit && (
          <form onSubmit={handleSubmit} className="card grid gap-3">
            <div className="mb-2">
              <p className="label">Expediente clinico</p>
              <h3 className="mt-2 text-xl font-black">{editingId ? 'Editar paciente' : 'Ingresar paciente'}</h3>
            </div>
            {Object.entries(fields).map(([key, label]) => (
              <label key={key} className="text-sm font-medium text-slate-700">
                {label}
                <input
                  className="input mt-1"
                  required
                  type={key === 'email' ? 'email' : key === 'birthDate' ? 'date' : 'text'}
                  max={key === 'birthDate' ? new Date().toISOString().slice(0, 10) : undefined}
                  value={form[key] || ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
            <button className="btn-primary mt-2" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear paciente'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancelar edicion
              </button>
            )}
          </form>
        )}

        <section className="card overflow-hidden">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="label">Directorio</p>
              <h3 className="mt-1 text-xl font-black">Pacientes activos</h3>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2 md:w-[420px]">
              <input className="input" placeholder="Buscar por nombre o documento" value={search} onChange={(e) => setSearch(e.target.value)} />
              <button className="btn-secondary" type="submit" disabled={loading}>Buscar</button>
            </form>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="table-cell">Paciente</th>
                  <th className="table-cell">Documento</th>
                  <th className="table-cell">Contacto</th>
                  {canEdit && <th className="table-cell">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr key={patient.id} className="transition hover:bg-[#F7F9FB]">
                    <td className="table-cell font-bold text-[#1A2B4C]">{patient.firstName} {patient.lastName}<br /><span className="font-normal text-[#1A2B4C]/50">Paciente activo</span></td>
                    <td className="table-cell"><span className="rounded-full bg-[#F7F9FB] px-3 py-1 font-semibold text-[#1A2B4C]">{patient.documentId}</span></td>
                    <td className="table-cell text-[#1A2B4C]/65">{patient.phone}<br />{patient.email}</td>
                    {canEdit && (
                      <td className="table-cell">
                        <button className="action-link mr-2 text-[#28A745]" onClick={() => edit(patient)}>Editar</button>
                        <button className="action-link text-red-600" onClick={() => remove(patient.id)}>Desactivar</button>
                      </td>
                    )}
                  </tr>
                ))}
                {patients.length === 0 && (
                  <tr><td className="table-cell text-slate-500" colSpan={canEdit ? 4 : 3}>{loading ? 'Cargando pacientes...' : 'No hay pacientes para mostrar.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
