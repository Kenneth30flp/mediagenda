import { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader.jsx';
import { api } from '../lib/api.js';

const emptyPatient = { firstName: '', lastName: '', documentId: '', phone: '', email: '', birthDate: '' };

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyPatient);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  async function loadPatients() {
    setPatients(await api(`/patients?search=${encodeURIComponent(search)}`));
  }

  useEffect(() => {
    loadPatients().catch(console.error);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const path = editingId ? `/patients/${editingId}` : '/patients';
    const method = editingId ? 'PUT' : 'POST';
    await api(path, { method, body: JSON.stringify(form) });
    setForm(emptyPatient);
    setEditingId(null);
    await loadPatients();
  }

  function edit(patient) {
    setEditingId(patient.id);
    setForm({ ...patient, birthDate: patient.birthDate?.slice(0, 10) });
  }

  async function remove(id) {
    if (!confirm('Deseas desactivar este paciente?')) return;
    await api(`/patients/${id}`, { method: 'DELETE' });
    await loadPatients();
  }

  return (
    <>
      <PageHeader title="Gestion de pacientes" subtitle="Registro, busqueda y actualizacion de expedientes activos." />
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={handleSubmit} className="card grid gap-3">
          <div className="mb-2">
            <p className="label">Expediente clinico</p>
            <h3 className="mt-2 text-xl font-black">{editingId ? 'Editar paciente' : 'Ingresar paciente'}</h3>
          </div>
          {Object.entries({ firstName: 'Nombre', lastName: 'Apellido', documentId: 'Documento', phone: 'Telefono', email: 'Correo electronico', birthDate: 'Fecha de nacimiento' }).map(([key, label]) => (
            <label key={key} className="text-sm font-medium text-slate-700">
              {label}
              <input className="input mt-1" required type={key === 'email' ? 'email' : key === 'birthDate' ? 'date' : 'text'} value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </label>
          ))}
          <button className="btn-primary mt-2">{editingId ? 'Guardar cambios' : 'Crear paciente'}</button>
        </form>

        <section className="card overflow-hidden">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="label">Directorio</p>
              <h3 className="mt-1 text-xl font-black">Pacientes activos</h3>
            </div>
            <div className="flex gap-2 md:w-[420px]">
            <input className="input" placeholder="Buscar por nombre o documento" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn-secondary" onClick={loadPatients}>Buscar</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500"><tr><th className="table-cell">Paciente</th><th className="table-cell">Documento</th><th className="table-cell">Contacto</th><th className="table-cell">Acciones</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr key={patient.id} className="transition hover:bg-[#F7F9FB]"><td className="table-cell font-bold text-[#1A2B4C]">{patient.firstName} {patient.lastName}<br /><span className="font-normal text-[#1A2B4C]/50">Paciente activo</span></td><td className="table-cell"><span className="rounded-full bg-[#F7F9FB] px-3 py-1 font-semibold text-[#1A2B4C]">{patient.documentId}</span></td><td className="table-cell text-[#1A2B4C]/65">{patient.phone}<br />{patient.email}</td><td className="table-cell"><button className="action-link mr-2 text-[#28A745]" onClick={() => edit(patient)}>Editar</button><button className="action-link text-red-600" onClick={() => remove(patient.id)}>Desactivar</button></td></tr>
                ))}
                {patients.length === 0 && <tr><td className="table-cell text-slate-500" colSpan="4">No hay pacientes para mostrar.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
