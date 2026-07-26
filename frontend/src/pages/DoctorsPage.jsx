import { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader.jsx';
import { api, getUser } from '../lib/api.js';

const emptyDoctor = { firstName: '', lastName: '', specialty: '', medicalLicense: '', email: '', availability: '' };

export default function DoctorsPage() {
  const user = getUser();
  const isAdmin = user?.role === 'admin';
  const [doctors, setDoctors] = useState([]);
  const [inactiveDoctors, setInactiveDoctors] = useState([]);
  const [form, setForm] = useState(emptyDoctor);
  const [editingId, setEditingId] = useState(null);

  async function loadDoctors() {
    const activeDoctors = await api('/doctors');
    setDoctors(activeDoctors);

    if (isAdmin) {
      setInactiveDoctors(await api('/doctors/inactive'));
    }
  }

  useEffect(() => {
    loadDoctors().catch(console.error);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await api(editingId ? `/doctors/${editingId}` : '/doctors', { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(form) });
    setForm(emptyDoctor);
    setEditingId(null);
    await loadDoctors();
  }

  async function remove(id) {
    if (!confirm('Deseas desactivar este doctor?')) return;
    await api(`/doctors/${id}`, { method: 'DELETE' });
    await loadDoctors();
  }

  async function restore(id) {
    await api(`/doctors/${id}/activate`, { method: 'PATCH' });
    await loadDoctors();
  }

  return (
    <>
      <PageHeader title="Staff medico" subtitle="Gestion de especialistas, licencias y disponibilidad operativa." />
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={handleSubmit} className="card grid gap-3">
          <div className="mb-2">
            <p className="label">Perfil profesional</p>
            <h3 className="mt-2 text-xl font-black">{editingId ? 'Editar doctor' : 'Ingresar doctor'}</h3>
          </div>
          {Object.entries({ firstName: 'Nombre', lastName: 'Apellido', specialty: 'Especialidad', medicalLicense: 'Licencia medica', email: 'Correo electronico', availability: 'Horario de disponibilidad' }).map(([key, label]) => (
            <label key={key} className="text-sm font-medium text-slate-700">
              {label}
              <input className="input mt-1" required type={key === 'email' ? 'email' : 'text'} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </label>
          ))}
          <button className="btn-primary mt-2">{editingId ? 'Guardar cambios' : 'Crear doctor'}</button>
        </form>
        <section className="card overflow-x-auto">
          <div className="mb-5">
            <p className="label">Directorio medico</p>
            <h3 className="mt-1 text-xl font-black">Doctores disponibles</h3>
          </div>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500"><tr><th className="table-cell">Doctor</th><th className="table-cell">Especialidad</th><th className="table-cell">Horario</th><th className="table-cell">Acciones</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="transition hover:bg-[#F7F9FB]"><td className="table-cell font-bold text-[#1A2B4C]">{doctor.firstName} {doctor.lastName}<br /><span className="font-normal text-[#1A2B4C]/50">{doctor.email}</span></td><td className="table-cell"><span className="rounded-full bg-[#28A745]/10 px-3 py-1 font-bold text-[#28A745]">{doctor.specialty}</span><br /><span className="mt-2 inline-block text-[#1A2B4C]/50">{doctor.medicalLicense}</span></td><td className="table-cell text-[#1A2B4C]/65">{doctor.availability}</td><td className="table-cell"><button className="action-link mr-2 text-[#28A745]" onClick={() => { setEditingId(doctor.id); setForm(doctor); }}>Editar</button>{isAdmin && <button className="action-link text-red-600" onClick={() => remove(doctor.id)}>Desactivar</button>}</td></tr>
              ))}
              {doctors.length === 0 && <tr><td className="table-cell text-slate-500" colSpan="4">No hay doctores para mostrar.</td></tr>}
            </tbody>
          </table>
        </section>
        {isAdmin && <section className="card overflow-x-auto xl:col-span-2">
          <div className="mb-5">
            <p className="label">Administracion</p>
            <h3 className="mt-1 text-xl font-black">Doctores desactivados</h3>
          </div>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500"><tr><th className="table-cell">Doctor</th><th className="table-cell">Especialidad</th><th className="table-cell">Licencia</th><th className="table-cell">Acciones</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {inactiveDoctors.map((doctor) => (
                <tr key={doctor.id} className="transition hover:bg-[#F7F9FB]"><td className="table-cell font-bold text-[#1A2B4C]">{doctor.firstName} {doctor.lastName}<br /><span className="font-normal text-[#1A2B4C]/50">{doctor.email}</span></td><td className="table-cell text-[#1A2B4C]/70">{doctor.specialty}</td><td className="table-cell text-[#1A2B4C]/70">{doctor.medicalLicense}</td><td className="table-cell"><button className="btn-secondary text-[#28A745]" onClick={() => restore(doctor.id)}>Reactivar</button></td></tr>
              ))}
              {inactiveDoctors.length === 0 && <tr><td className="table-cell text-slate-500" colSpan="4">No hay doctores desactivados.</td></tr>}
            </tbody>
          </table>
        </section>}
      </div>
    </>
  );
}
