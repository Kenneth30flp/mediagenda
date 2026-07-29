import { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Alert from '../components/ui/Alert.jsx';
import { api, getUser } from '../lib/api.js';

const statusLabels = {
  pending: 'Pendientes',
  completed: 'Completadas',
  cancelled: 'Canceladas'
};

const statusClasses = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  completed: 'border-[#28A745]/25 bg-[#28A745]/10 text-[#28A745]',
  cancelled: 'border-red-200 bg-red-50 text-red-700'
};

function MedicalIllustration() {
  return (
    <div className="relative min-h-64 overflow-hidden rounded-[2rem] bg-[#1A2B4C] p-6 text-white shadow-soft">
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#28A745]/25 blur-3xl" />
      <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="relative z-10">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-white/55">Centro medico digital</p>
        <h3 className="mt-4 max-w-sm text-3xl font-black leading-tight">Operacion clinica segura, clara y conectada.</h3>
        <p className="mt-4 max-w-md text-sm leading-6 text-white/70">MediAgenda centraliza agenda, personal medico y atencion al paciente en una plataforma profesional.</p>
      </div>
      <div className="absolute bottom-5 right-6 hidden h-44 w-52 rounded-[2rem] border border-white/15 bg-white/10 p-4 backdrop-blur md:block">
        <div className="mb-3 h-3 w-24 rounded-full bg-white/25" />
        <div className="grid gap-3">
          <div className="h-10 rounded-2xl bg-white/15" />
          <div className="h-10 rounded-2xl bg-[#28A745]/50" />
          <div className="h-10 rounded-2xl bg-white/15" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail, tone = 'bg-[#1A2B4C]' }) {
  return (
    <article className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-soft">
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-[3rem] ${tone} opacity-90`} />
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <strong className="mt-4 block text-5xl font-black tracking-tight text-ink">{value}</strong>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </article>
  );
}

function AppointmentList({ appointments }) {
  const nextAppointments = appointments.slice(0, 4);

  return (
    <div className="grid gap-3">
      {nextAppointments.map((appointment) => (
        <article key={appointment.id} className="rounded-3xl border border-[#B0B0B0]/25 bg-[#F7F9FB] p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black text-[#1A2B4C]">{new Date(appointment.appointmentAt).toLocaleString()}</p>
              <p className="mt-1 text-sm text-[#1A2B4C]/65">{appointment.patientName}</p>
            </div>
            <div className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-black uppercase ${statusClasses[appointment.status]}`}>
              {appointment.status}
            </div>
          </div>
        </article>
      ))}
      {nextAppointments.length === 0 && <div className="rounded-3xl border border-dashed border-[#B0B0B0]/40 p-8 text-center text-sm font-semibold text-[#1A2B4C]/60">No hay citas para mostrar.</div>}
    </div>
  );
}

export default function DashboardPage() {
  const user = getUser();
  const isDoctor = user?.role === 'doctor';
  const [metrics, setMetrics] = useState({ totalPatients: 0, activeDoctors: 0, todayAppointments: 0 });
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const requests = isDoctor ? [api('/appointments')] : [api('/dashboard/metrics'), api('/appointments')];

    Promise.all(requests)
      .then((data) => {
        if (isDoctor) {
          setAppointments(data[0]);
          return;
        }

        setMetrics(data[0]);
        setAppointments(data[1]);
      })
      .catch((err) => setError(err.message));
  }, [isDoctor]);

  const today = new Date().toDateString();
  const todayAppointments = appointments.filter((appointment) => new Date(appointment.appointmentAt).toDateString() === today);
  const pendingAppointments = appointments.filter((appointment) => appointment.status === 'pending');
  const completedAppointments = appointments.filter((appointment) => appointment.status === 'completed');

  if (isDoctor) {
    return (
      <>
        <PageHeader title="Mi jornada medica" subtitle="Resumen de tus citas asignadas y seguimiento de atencion." />
        <Alert tone="error" message={error} onClose={() => setError('')} />

        <section className="mb-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <MedicalIllustration />
          <article className="card">
            <p className="label">Perfil medico</p>
            <h3 className="mt-2 text-2xl font-black text-[#1A2B4C]">{user?.name}</h3>
            <p className="mt-2 text-sm leading-6 text-[#1A2B4C]/65">Este panel muestra unicamente las citas vinculadas a tu usuario medico. Las metricas administrativas quedan reservadas para administracion y recepcion.</p>
            <div className="mt-5 rounded-2xl border border-[#28A745]/25 bg-[#28A745]/10 px-4 py-3 text-sm font-bold text-[#28A745]">Agenda personal protegida</div>
          </article>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <MetricCard label="Mis citas" value={appointments.length} detail="Total asignadas" />
          <MetricCard label="Pendientes" value={pendingAppointments.length} detail="Por atender" tone="bg-amber-400" />
          <MetricCard label="Completadas" value={completedAppointments.length} detail="Atenciones cerradas" tone="bg-[#28A745]" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <article className="card">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="label">Agenda personal</p>
                <h3 className="mt-1 text-xl font-black">Proximas citas asignadas</h3>
              </div>
              <div className="rounded-2xl border border-[#B0B0B0]/25 bg-[#F7F9FB] px-4 py-2 text-sm font-bold text-[#1A2B4C]/70">{todayAppointments.length} hoy</div>
            </div>
            <AppointmentList appointments={appointments} />
          </article>

          <article className="card bg-white">
            <p className="label">Prioridad clinica</p>
            <h3 className="mt-2 text-2xl font-black text-[#1A2B4C]">Mantener estados actualizados</h3>
            <p className="mt-3 text-sm leading-6 text-[#1A2B4C]/65">Marca cada cita como completada o cancelada desde el modulo de Citas para mantener la operacion al dia.</p>
          </article>
        </section>
      </>
    );
  }

  const adminCards = [
    { label: 'Total de pacientes', value: metrics.totalPatients, detail: 'Registros activos', tone: 'bg-[#1A2B4C]' },
    { label: 'Doctores activos', value: metrics.activeDoctors, detail: 'Especialistas disponibles', tone: 'bg-[#28A745]' },
    { label: 'Citas de hoy', value: metrics.todayAppointments, detail: 'Agenda del dia', tone: 'bg-[#B0B0B0]' }
  ];

  return (
    <>
      <PageHeader title="Panel ejecutivo" subtitle="Resumen operativo de la clinica con indicadores clave para toma de decisiones." />
      <Alert tone="error" message={error} onClose={() => setError('')} />

      <section className="mb-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <MedicalIllustration />
        <article className="card">
          <p className="label">Direccion operativa</p>
          <h3 className="mt-2 text-2xl font-black text-[#1A2B4C]">Vista institucional</h3>
          <p className="mt-3 text-sm leading-6 text-[#1A2B4C]/65">Control global de pacientes, doctores y agenda diaria para administracion y recepcion.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#F7F9FB] p-4 text-sm font-bold text-[#1A2B4C]">Roles protegidos</div>
            <div className="rounded-2xl bg-[#F7F9FB] p-4 text-sm font-bold text-[#1A2B4C]">Datos centralizados</div>
          </div>
        </article>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        {adminCards.map((card) => <MetricCard key={card.label} {...card} />)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="card">
          <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="label">Operacion diaria</p>
              <h3 className="mt-1 text-xl font-black">Citas recientes</h3>
            </div>
            <div className="rounded-2xl bg-[#1A2B4C] px-5 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Estado</p>
              <p className="mt-1 text-lg font-black">Clinica operativa</p>
            </div>
          </div>
          <AppointmentList appointments={appointments} />
        </article>

        <article className="card bg-[#1A2B4C] text-white">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">Recomendacion</p>
          <h3 className="mt-4 text-2xl font-black">Agenda sin conflictos</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">El sistema evita duplicar citas para un mismo doctor en la misma fecha y hora.</p>
          <div className="mt-6 grid gap-3">
            {Object.entries(statusLabels).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold">
                <span>{label}</span>
                <span>{appointments.filter((appointment) => appointment.status === key).length}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
