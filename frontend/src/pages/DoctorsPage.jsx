import { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Alert from '../components/ui/Alert.jsx';
import { useFeedback } from '../hooks/useFeedback.js';
import { api, getUser, isEditor } from '../lib/api.js';

const emptyDoctor = { firstName: '', lastName: '', specialty: '', medicalLicense: '', email: '', availability: '' };

const fields = {
  firstName: 'Nombre',
  lastName: 'Apellido',
  specialty: 'Especialidad',
  medicalLicense: 'Licencia medica',
  email: 'Correo electronico',
  availability: 'Horario de disponibilidad'
};

export default function DoctorsPage() {
  const user = getUser();
  const isAdmin = user?.role === 'admin';
  const canEdit = isEditor(user);
  const [doctors, setDoctors] = useState([]);
  const [inactiveDoctors, setInactiveDoctors] = useState([]);
  const [form, setForm] = useState(emptyDoctor);
  const [editingId, setEditingId] = useState(null);
  const { error, success, loading, clear, run } = useFeedback();

  async function fetchDoctors() {
    setDoctors(await api('/doctors'));

    if (isAdmin) {
      setInactiveDoctors(await api('/doctors/inactive'));
    }
  }

  useEffect(() => {
    run(fetchDoctors);
  }, []);

  function resetForm() {
    setForm(emptyDoctor);
    setEditingId(null);
    clear();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = Object.fromEntries(Object.keys(emptyDoctor).map((key) => [key, form[key]]));
    const wasEditing = Boolean(editingId);

    const saved = await run(async () => {
      const doctor = await api(wasEditing ? `/doctors/${editingId}` : '/doctors', {
        method: wasEditing ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      await fetchDoctors();
      return doctor;
    }, wasEditing ? 'Doctor actualizado correctamente.' : 'Doctor creado correctamente.');

    if (!saved) return;

    setForm(emptyDoctor);
    setEditingId(null);
  }

  function edit(doctor) {
    clear();
    setEditingId(doctor.id);
    setForm(Object.fromEntries(Object.keys(emptyDoctor).map((key) => [key, doctor[key] || ''])));
  }

  async function remove(id) {
    if (!confirm('Deseas desactivar este doctor? Sus citas historicas se conservan.')) return;

    const done = await run(async () => {
      await api(`/doctors/${id}`, { method: 'DELETE' });
      await fetchDoctors();
      return true;
    }, 'Doctor desactivado correctamente.');

    if (done && editingId === id) {
      setForm(emptyDoctor);
      setEditingId(null);
    }
  }

  async function restore(id) {
    await run(async () => {
      await api(`/doctors/${id}/activate`, { method: 'PATCH' });
      await fetchDoctors();
    }, 'Doctor reactivado correctamente.');
  }

  return (
    <>
      <PageHeader title="Staff medico" subtitle="Gestion de especialistas, licencias y disponibilidad operativa." />
      <Alert tone="error" message={error} onClose={clear} />
      <Alert tone="success" message={success} onClose={clear} />

      <div className={`grid gap-6 ${canEdit ? 'xl:grid-cols-[380px_1fr]' : ''}`}>
        {canEdit && (
          <form onSubmit={handleSubmit} className="card grid gap-3">
            <div className="mb-2">
              <p className="label">Perfil profesional</p>
              <h3 className="mt-2 text-xl font-black">{editingId ? 'Editar doctor' : 'Ingresar doctor'}</h3>
            </div>
            {Object.entries(fields).map(([key, label]) => (
              <label key={key} className="text-sm font-medium text-slate-700">
                {label}
                <input
                  className="input mt-1"
                  required
                  type={key === 'email' ? 'email' : 'text'}
                  value={form[key] || ''}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
            <button className="btn-primary mt-2" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear doctor'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancelar edicion
              </button>
            )}
          </form>
        )}

        <section className="card overflow-x-auto">
          <div className="mb-5">
            <p className="label">Directorio medico</p>
            <h3 className="mt-1 text-xl font-black">Doctores disponibles</h3>
          </div>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="table-cell">Doctor</th>
                <th className="table-cell">Especialidad</th>
                <th className="table-cell">Horario</th>
                {canEdit && <th className="table-cell">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="transition hover:bg-[#F7F9FB]">
                  <td className="table-cell font-bold text-[#1A2B4C]">{doctor.firstName} {doctor.lastName}<br /><span className="font-normal text-[#1A2B4C]/50">{doctor.email}</span></td>
                  <td className="table-cell"><span className="rounded-full bg-[#28A745]/10 px-3 py-1 font-bold text-[#28A745]">{doctor.specialty}</span><br /><span className="mt-2 inline-block text-[#1A2B4C]/50">{doctor.medicalLicense}</span></td>
                  <td className="table-cell text-[#1A2B4C]/65">{doctor.availability}</td>
                  {canEdit && (
                    <td className="table-cell">
                      <button className="action-link mr-2 text-[#28A745]" onClick={() => edit(doctor)}>Editar</button>
                      {isAdmin && <button className="action-link text-red-600" onClick={() => remove(doctor.id)}>Desactivar</button>}
                    </td>
                  )}
                </tr>
              ))}
              {doctors.length === 0 && (
                <tr><td className="table-cell text-slate-500" colSpan={canEdit ? 4 : 3}>{loading ? 'Cargando doctores...' : 'No hay doctores para mostrar.'}</td></tr>
              )}
            </tbody>
          </table>
        </section>

        {isAdmin && (
          <section className={`card overflow-x-auto ${canEdit ? 'xl:col-span-2' : ''}`}>
            <div className="mb-5">
              <p className="label">Administracion</p>
              <h3 className="mt-1 text-xl font-black">Doctores desactivados</h3>
            </div>
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr><th className="table-cell">Doctor</th><th className="table-cell">Especialidad</th><th className="table-cell">Licencia</th><th className="table-cell">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inactiveDoctors.map((doctor) => (
                  <tr key={doctor.id} className="transition hover:bg-[#F7F9FB]">
                    <td className="table-cell font-bold text-[#1A2B4C]">{doctor.firstName} {doctor.lastName}<br /><span className="font-normal text-[#1A2B4C]/50">{doctor.email}</span></td>
                    <td className="table-cell text-[#1A2B4C]/70">{doctor.specialty}</td>
                    <td className="table-cell text-[#1A2B4C]/70">{doctor.medicalLicense}</td>
                    <td className="table-cell"><button className="btn-secondary text-[#28A745]" onClick={() => restore(doctor.id)} disabled={loading}>Reactivar</button></td>
                  </tr>
                ))}
                {inactiveDoctors.length === 0 && <tr><td className="table-cell text-slate-500" colSpan="4">No hay doctores desactivados.</td></tr>}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </>
  );
}
