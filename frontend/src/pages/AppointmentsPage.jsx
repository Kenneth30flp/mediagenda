import { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader.jsx';
import { api, getUser } from '../lib/api.js';

const statusClasses = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-[#28A745]/10 text-[#28A745] border-[#28A745]/25',
  cancelled: 'bg-red-50 text-red-700 border-red-200'
};

export default function AppointmentsPage() {
  const user = getUser();
  const canManageAppointments = ['admin', 'recepcion'].includes(user?.role);
  const canChangeAppointmentStatus = user?.role === 'admin' || (user?.role === 'doctor' && user?.accessLevel === 'editor');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [specialty, setSpecialty] = useState('');
  const [form, setForm] = useState({ patientId: '', doctorId: '', appointmentAt: '' });

  const specialties = [...new Set(doctors.map((doctor) => doctor.specialty))].sort();

  const filteredDoctors = doctors.filter((doctor) =>
    !specialty || doctor.specialty === specialty
  );

  async function loadData() {
    if (!canManageAppointments) {
      setAppointments(await api('/appointments'));
      return;
    }

    const [patientsData, doctorsData, appointmentsData] = await Promise.all([api('/patients'), api('/doctors'), api('/appointments')]);
    setPatients(patientsData);
    setDoctors(doctorsData);
    setAppointments(appointmentsData);
  }

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  useEffect(() => {
    if (form.doctorId && !filteredDoctors.some((doctor) => doctor.id === Number(form.doctorId))) {
      setForm((current) => ({ ...current, doctorId: '' }));
    }
  }, [specialty, doctors]);

  async function handleSubmit(event) {
    event.preventDefault();
    await api('/appointments', {
      method: 'POST',
      body: JSON.stringify({ patientId: Number(form.patientId), doctorId: Number(form.doctorId), appointmentAt: new Date(form.appointmentAt).toISOString() })
    });
    setForm({ patientId: '', doctorId: '', appointmentAt: '' });
    await loadData();
  }

  async function changeStatus(id, status) {
    await api(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await loadData();
  }

  return (
    <>
      <PageHeader title="Agenda medica" subtitle="Programacion, seguimiento y control del estado de cada cita." />
      <div className={`grid gap-6 ${canManageAppointments ? 'xl:grid-cols-[380px_1fr]' : ''}`}>
        {canManageAppointments && <form onSubmit={handleSubmit} className="card grid gap-3">
          <div className="mb-2">
            <p className="label">Nueva reserva</p>
            <h3 className="mt-2 text-xl font-black">Programar cita</h3>
          </div>
          <label className="text-sm font-medium text-slate-700">Paciente<select className="input mt-1" required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}><option value="">Seleccionar</option>{patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700">Especialidad<select className="input mt-1" value={specialty} onChange={(e) => setSpecialty(e.target.value)}><option value="">Todas las especialidades</option>{specialties.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700">Doctor<select className="input mt-1" required value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}><option value="">Seleccionar doctor</option>{filteredDoctors.map((d) => <option key={d.id} value={d.id}>{d.firstName} {d.lastName} - {d.specialty}</option>)}</select></label>
          {filteredDoctors.length === 0 && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">No hay doctores disponibles para esta especialidad.</div>}
          <label className="text-sm font-medium text-slate-700">Fecha y hora<input className="input mt-1" required type="datetime-local" value={form.appointmentAt} onChange={(e) => setForm({ ...form, appointmentAt: e.target.value })} /></label>
          <button className="btn-primary mt-2">Crear cita</button>
        </form>}
        <section className="card overflow-hidden">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="label">Calendario operacional</p>
              <h3 className="mt-1 text-xl font-black">Citas agendadas</h3>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600">{appointments.length} citas registradas</div>
          </div>
          <div className="grid gap-3">
            {appointments.map((appointment) => (
              <article key={appointment.id} className="rounded-3xl border border-[#B0B0B0]/25 bg-[#F7F9FB] p-4 transition hover:border-[#28A745]/35 hover:bg-white">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="grid gap-3 sm:grid-cols-3 lg:flex-1">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#28A745]">Fecha</p>
                      <p className="mt-1 text-sm font-black text-[#1A2B4C]">{new Date(appointment.appointmentAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#28A745]">Paciente</p>
                      <p className="mt-1 text-sm font-semibold text-[#1A2B4C]/75">{appointment.patientName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#28A745]">Doctor</p>
                      <p className="mt-1 text-sm font-semibold text-[#1A2B4C]/75">{appointment.doctorName}</p>
                      <p className="text-xs text-[#1A2B4C]/50">{appointment.specialty}</p>
                    </div>
                  </div>
                  <div className="w-full lg:w-52">
                    <div className={`mb-2 inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase ${statusClasses[appointment.status]}`}>{appointment.status}</div>
                    {canChangeAppointmentStatus ? <select className="input" value={appointment.status} onChange={(e) => changeStatus(appointment.id, e.target.value)}>
                      <option value="pending">Pendiente</option>
                      <option value="completed">Completada</option>
                      <option value="cancelled">Cancelada</option>
                    </select> : <p className="rounded-2xl border border-[#B0B0B0]/25 bg-white px-3 py-2 text-sm font-semibold text-[#1A2B4C]/70">Estado asignado por doctor</p>}
                  </div>
                </div>
              </article>
            ))}
            {appointments.length === 0 && <div className="rounded-3xl border border-dashed border-[#B0B0B0]/40 p-8 text-center text-sm font-semibold text-[#1A2B4C]/60">No hay citas agendadas.</div>}
          </div>
        </section>
      </div>
    </>
  );
}
