import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Alert from '../components/ui/Alert.jsx';
import { useFeedback } from '../hooks/useFeedback.js';
import { api, getUser, isEditor } from '../lib/api.js';

const statusClasses = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-[#28A745]/10 text-[#28A745] border-[#28A745]/25',
  cancelled: 'bg-red-50 text-red-700 border-red-200'
};

const statusLabels = {
  pending: 'Pendiente',
  completed: 'Completada',
  cancelled: 'Cancelada'
};

// datetime-local espera "YYYY-MM-DDTHH:mm" en hora local, no en UTC.
function toLocalInputValue(date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function AppointmentsPage() {
  const user = getUser();
  const canCreateAppointments = ['admin', 'recepcion'].includes(user?.role) && isEditor(user);
  const canChangeAppointmentStatus = user?.role === 'admin' || (user?.role === 'doctor' && user?.accessLevel === 'editor');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [specialty, setSpecialty] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ patientId: '', doctorId: '', appointmentAt: '' });
  const { error, success, loading, clear, run } = useFeedback();

  const minDateTime = useMemo(() => toLocalInputValue(new Date()), []);
  const specialties = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.specialty))].sort(),
    [doctors]
  );
  const filteredDoctors = useMemo(
    () => doctors.filter((doctor) => !specialty || doctor.specialty === specialty),
    [doctors, specialty]
  );
  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => String(doctor.id) === String(form.doctorId)),
    [doctors, form.doctorId]
  );
  const visibleAppointments = useMemo(
    () => appointments.filter((appointment) => !statusFilter || appointment.status === statusFilter),
    [appointments, statusFilter]
  );

  async function fetchData() {
    if (!canCreateAppointments) {
      setAppointments(await api('/appointments'));
      return;
    }

    const [patientsData, doctorsData, appointmentsData] = await Promise.all([
      api('/patients'),
      api('/doctors'),
      api('/appointments')
    ]);
    setPatients(patientsData);
    setDoctors(doctorsData);
    setAppointments(appointmentsData);
  }

  useEffect(() => {
    run(fetchData);
  }, []);

  useEffect(() => {
    if (form.doctorId && !filteredDoctors.some((doctor) => String(doctor.id) === String(form.doctorId))) {
      setForm((current) => ({ ...current, doctorId: '' }));
    }
  }, [filteredDoctors, form.doctorId]);

  async function handleSubmit(event) {
    event.preventDefault();

    const selectedDate = new Date(form.appointmentAt);

    if (Number.isNaN(selectedDate.getTime())) {
      return;
    }

    const saved = await run(async () => {
      const appointment = await api('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          patientId: Number(form.patientId),
          doctorId: Number(form.doctorId),
          appointmentAt: selectedDate.toISOString()
        })
      });
      setAppointments(await api('/appointments'));
      return appointment;
    }, 'Cita agendada correctamente.');

    if (saved) {
      setForm({ patientId: '', doctorId: '', appointmentAt: '' });
    }
  }

  async function changeStatus(id, status) {
    await run(async () => {
      await api(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setAppointments(await api('/appointments'));
    }, 'Estado de la cita actualizado.');
  }

  return (
    <>
      <PageHeader title="Agenda medica" subtitle="Programacion, seguimiento y control del estado de cada cita." />
      <Alert tone="error" message={error} onClose={clear} />
      <Alert tone="success" message={success} onClose={clear} />

      <div className={`grid gap-6 ${canCreateAppointments ? 'xl:grid-cols-[380px_1fr]' : ''}`}>
        {canCreateAppointments && (
          <form onSubmit={handleSubmit} className="card grid gap-3">
            <div className="mb-2">
              <p className="label">Nueva reserva</p>
              <h3 className="mt-2 text-xl font-black">Programar cita</h3>
            </div>
            <label className="text-sm font-medium text-slate-700">
              Paciente
              <select className="input mt-1" required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
                <option value="">Seleccionar</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Especialidad
              <select className="input mt-1" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                <option value="">Todas las especialidades</option>
                {specialties.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Doctor
              <select className="input mt-1" required value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
                <option value="">Seleccionar doctor</option>
                {filteredDoctors.map((d) => <option key={d.id} value={d.id}>{d.firstName} {d.lastName} - {d.specialty}</option>)}
              </select>
            </label>
            {filteredDoctors.length === 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                No hay doctores disponibles para esta especialidad.
              </div>
            )}
            {selectedDoctor && (
              <div className="rounded-2xl border border-[#28A745]/25 bg-[#28A745]/10 px-3 py-2 text-sm font-semibold text-[#1A2B4C]">
                Horario disponible: <span className="text-[#28A745]">{selectedDoctor.availability}</span>
              </div>
            )}
            <label className="text-sm font-medium text-slate-700">
              Fecha y hora
              <input
                className="input mt-1"
                required
                type="datetime-local"
                min={minDateTime}
                value={form.appointmentAt}
                onChange={(e) => setForm({ ...form, appointmentAt: e.target.value })}
              />
            </label>
            <button className="btn-primary mt-2" disabled={loading}>{loading ? 'Guardando...' : 'Crear cita'}</button>
          </form>
        )}

        <section className="card overflow-hidden">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="label">Calendario operacional</p>
              <h3 className="mt-1 text-xl font-black">Citas agendadas</h3>
            </div>
            <div className="flex items-center gap-3">
              <select className="input md:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Todos los estados</option>
                {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <div className="whitespace-nowrap rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600">
                {visibleAppointments.length} citas
              </div>
            </div>
          </div>
          <div className="grid gap-3">
            {visibleAppointments.map((appointment) => (
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
                    <div className={`mb-2 inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase ${statusClasses[appointment.status]}`}>
                      {statusLabels[appointment.status] || appointment.status}
                    </div>
                    {canChangeAppointmentStatus ? (
                      <select className="input" value={appointment.status} disabled={loading} onChange={(e) => changeStatus(appointment.id, e.target.value)}>
                        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    ) : (
                      <p className="rounded-2xl border border-[#B0B0B0]/25 bg-white px-3 py-2 text-sm font-semibold text-[#1A2B4C]/70">Estado asignado por el doctor</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
            {visibleAppointments.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[#B0B0B0]/40 p-8 text-center text-sm font-semibold text-[#1A2B4C]/60">
                {loading ? 'Cargando citas...' : 'No hay citas agendadas.'}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
