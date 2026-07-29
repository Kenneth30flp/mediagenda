import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader.jsx';
import Alert from '../components/ui/Alert.jsx';
import StatTile from '../components/ui/StatTile.jsx';
import { DashboardSkeleton } from '../components/ui/Skeleton.jsx';
import TrendBarChart from '../components/charts/TrendBarChart.jsx';
import StatusDonut from '../components/charts/StatusDonut.jsx';
import SpecialtyBars from '../components/charts/SpecialtyBars.jsx';
import DoctorLeaderboard from '../components/charts/DoctorLeaderboard.jsx';
import { CalendarIcon, ClipboardIcon, ClockIcon, PlusIcon, RefreshIcon, SearchIcon, UsersIcon } from '../components/icons/Icons.jsx';
import { api, getUser, isEditor } from '../lib/api.js';
import {
  buildDelta,
  buildDoctorLeaderboard,
  buildSpecialtyBreakdown,
  buildStatusBreakdown,
  buildWeeklyTrend,
  formatRelativeTime,
  getUpcomingAppointments,
  greetingFor,
  groupByHorizon
} from '../lib/dashboardMetrics.js';

const REFRESH_INTERVAL_MS = 45_000;

const STATUS_BADGE = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  completed: 'border-[#28A745]/25 bg-[#28A745]/10 text-[#28A745]',
  cancelled: 'border-red-200 bg-red-50 text-red-700'
};

const STATUS_TEXT = { pending: 'Pendiente', completed: 'Completada', cancelled: 'Cancelada' };

const HORIZON_META = {
  vencidas: { title: 'Vencidas', hint: 'Pendientes que ya pasaron su fecha' },
  hoy: { title: 'Hoy', hint: null },
  manana: { title: 'Manana', hint: null },
  semana: { title: 'Esta semana', hint: null },
  despues: { title: 'Mas adelante', hint: null }
};

function formatTime(value) {
  return new Date(value).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

function formatDay(value) {
  return new Date(value).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
}

function AppointmentRow({ appointment, showDoctor, overdue }) {
  return (
    <article className={`rounded-2xl border p-3.5 transition ${overdue ? 'border-red-200 bg-red-50/60' : 'border-[#B0B0B0]/20 bg-[#F7F9FB] hover:border-[#28A745]/35 hover:bg-white'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-[#1A2B4C]">
            {formatDay(appointment.appointmentAt)} · {formatTime(appointment.appointmentAt)}
          </p>
          <p className="mt-0.5 truncate text-sm text-[#1A2B4C]/70">
            {appointment.patientName}
            {showDoctor && <span className="text-[#1A2B4C]/45"> · {appointment.doctorName} ({appointment.specialty})</span>}
          </p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${STATUS_BADGE[appointment.status]}`}>
          {STATUS_TEXT[appointment.status] || appointment.status}
        </span>
      </div>
    </article>
  );
}

function LiveClock({ now }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-white backdrop-blur">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#28A745] opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#28A745]" />
      </span>
      <span className="text-sm font-bold tabular-nums">{now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      <span className="hidden text-xs text-white/60 sm:inline">{now.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
    </div>
  );
}

export default function DashboardPage() {
  const user = getUser();
  const isDoctor = user?.role === 'doctor';
  const canManagePatients = ['admin', 'recepcion'].includes(user?.role);
  const canManageUsers = user?.role === 'admin';
  const canCreateAppointments = ['admin', 'recepcion'].includes(user?.role) && isEditor(user);

  const [metrics, setMetrics] = useState({ totalPatients: 0, activeDoctors: 0, todayAppointments: 0 });
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [now, setNow] = useState(new Date());
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);

    try {
      const requests = isDoctor ? [api('/appointments')] : [api('/dashboard/metrics'), api('/appointments')];
      const results = await Promise.all(requests);

      if (isDoctor) {
        setAppointments(results[0]);
      } else {
        setMetrics(results[0]);
        setAppointments(results[1]);
      }

      setLastUpdated(new Date());
      if (!silent) setError('');
    } catch (err) {
      // Un refresco silencioso fallido no debe tapar el dashboard con un error:
      // se mantiene la ultima vista buena y se reintenta en el proximo ciclo.
      if (!silent) setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isDoctor]);

  useEffect(() => {
    fetchData();
    const poll = setInterval(() => fetchData({ silent: true }), REFRESH_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [fetchData]);

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const weeklyTrend = useMemo(() => buildWeeklyTrend(appointments, 7, now), [appointments, now]);
  const statusBreakdown = useMemo(() => buildStatusBreakdown(appointments), [appointments]);
  const specialtyBreakdown = useMemo(() => buildSpecialtyBreakdown(appointments), [appointments]);
  const doctorLeaderboard = useMemo(() => buildDoctorLeaderboard(appointments), [appointments]);
  const horizons = useMemo(() => groupByHorizon(appointments, now), [appointments, now]);
  const nextAppointment = useMemo(() => getUpcomingAppointments(appointments, now)[0], [appointments, now]);

  const todayCount = weeklyTrend[weeklyTrend.length - 1]?.count || 0;
  const previousDays = weeklyTrend.slice(0, -1);
  const previousAvg = previousDays.reduce((sum, day) => sum + day.count, 0) / Math.max(previousDays.length, 1);
  const todayDelta = buildDelta(todayCount, previousAvg);
  const pendingCount = statusBreakdown.pending;
  const completedCount = statusBreakdown.completed;

  const filteredHorizons = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return horizons;

    const matches = (appointment) =>
      appointment.patientName?.toLowerCase().includes(term) ||
      appointment.doctorName?.toLowerCase().includes(term) ||
      appointment.specialty?.toLowerCase().includes(term);

    return Object.fromEntries(Object.entries(horizons).map(([key, list]) => [key, list.filter(matches)]));
  }, [horizons, search]);

  const totalUpcoming = Object.values(filteredHorizons).reduce((sum, list) => sum + list.length, 0);

  const quickActions = [
    canCreateAppointments
      ? { to: '/appointments', label: 'Nueva cita', hint: 'Programar en agenda', icon: PlusIcon, tone: 'bg-[#28A745]' }
      : { to: '/appointments', label: 'Ver agenda', hint: 'Consultar citas', icon: CalendarIcon, tone: 'bg-[#28A745]' },
    canManagePatients && { to: '/patients', label: 'Pacientes', hint: 'Expedientes activos', icon: UsersIcon, tone: 'bg-[#1A2B4C]' },
    canManagePatients && { to: '/doctors', label: 'Staff medico', hint: 'Especialistas y horarios', icon: ClipboardIcon, tone: 'bg-[#B0B0B0]' },
    canManageUsers && { to: '/users', label: 'Empleados', hint: 'Roles y permisos', icon: UsersIcon, tone: 'bg-[#1A2B4C]' }
  ].filter(Boolean);

  if (loading) {
    return (
      <>
        <PageHeader title={isDoctor ? 'Mi jornada medica' : 'Panel ejecutivo'} subtitle="Cargando informacion en tiempo real..." />
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <Alert tone="error" message={error} onClose={() => setError('')} />

      {/* Franja de saludo en vivo */}
      <section className="relative mb-6 overflow-hidden rounded-[2rem] bg-[#1A2B4C] p-6 text-white shadow-soft md:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#28A745]/25 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-white/55">{greetingFor(now)}, {user?.name?.split(' ')[0] || 'bienvenido'}</p>
            <h2 className="mt-3 max-w-xl text-2xl font-black leading-tight md:text-3xl">
              {isDoctor ? 'Este es el resumen de tu jornada clinica.' : 'Este es el pulso operativo de la clinica hoy.'}
            </h2>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <LiveClock now={now} />
            <button
              type="button"
              onClick={() => fetchData({ silent: true })}
              className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15 disabled:opacity-60"
              disabled={refreshing}
            >
              <RefreshIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
        {lastUpdated && (
          <p className="relative mt-4 text-xs font-semibold text-white/45">
            Ultima actualizacion: {lastUpdated.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · se refresca automaticamente cada 45s
          </p>
        )}
      </section>

      {/* KPIs */}
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        {isDoctor ? (
          <>
            <StatTile label="Mis citas totales" value={appointments.length} detail="Historial completo asignado" tone="bg-[#1A2B4C]" />
            <StatTile label="Citas hoy" value={todayCount} detail="Agenda del dia" delta={todayDelta} sparkline={weeklyTrend.map((d) => d.count)} tone="bg-[#28A745]" />
            <StatTile label="Pendientes" value={pendingCount} detail={`${completedCount} ya completadas`} tone="bg-amber-400" />
          </>
        ) : (
          <>
            <StatTile label="Total de pacientes" value={metrics.totalPatients} detail="Registros activos" tone="bg-[#1A2B4C]" />
            <StatTile label="Doctores activos" value={metrics.activeDoctors} detail="Especialistas disponibles" tone="bg-[#28A745]" />
            <StatTile label="Citas de hoy" value={metrics.todayAppointments} detail="Agenda del dia" delta={todayDelta} sparkline={weeklyTrend.map((d) => d.count)} tone="bg-[#B0B0B0]" />
          </>
        )}
      </section>

      {/* Tendencia semanal + estado */}
      <section className="mb-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="card">
          <div className="mb-4">
            <p className="label">Actividad semanal</p>
            <h3 className="mt-1 text-xl font-black">Citas de los ultimos 7 dias</h3>
          </div>
          <TrendBarChart data={weeklyTrend} />
        </article>

        <article className="card">
          <div className="mb-4">
            <p className="label">Distribucion</p>
            <h3 className="mt-1 text-xl font-black">Estado de las citas</h3>
          </div>
          <StatusDonut breakdown={statusBreakdown} />
        </article>
      </section>

      {/* Especialidad / ranking (solo vista institucional) o proxima cita (doctor) */}
      {isDoctor ? (
        <section className="mb-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="card bg-[#1A2B4C] text-white">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/55">Proxima cita</p>
            {nextAppointment ? (
              <>
                <h3 className="mt-4 text-2xl font-black">{nextAppointment.patientName}</h3>
                <p className="mt-2 text-sm text-white/70">{formatDay(nextAppointment.appointmentAt)} a las {formatTime(nextAppointment.appointmentAt)}</p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#28A745]/20 px-4 py-2.5 text-sm font-black text-[#28A745]">
                  <ClockIcon className="h-4 w-4" /> {formatRelativeTime(nextAppointment.appointmentAt, now)}
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm leading-6 text-white/70">No tienes citas pendientes proximamente. Tu agenda esta al dia.</p>
            )}
          </article>
          <article className="card">
            <p className="label">Prioridad clinica</p>
            <h3 className="mt-2 text-2xl font-black text-[#1A2B4C]">Mantener estados actualizados</h3>
            <p className="mt-3 text-sm leading-6 text-[#1A2B4C]/65">Marca cada cita como completada o cancelada desde el modulo de Citas para mantener la operacion al dia.</p>
            {horizons.vencidas.length > 0 && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                Tienes {horizons.vencidas.length} {horizons.vencidas.length === 1 ? 'cita vencida' : 'citas vencidas'} sin actualizar.
              </div>
            )}
          </article>
        </section>
      ) : (
        <section className="mb-6 grid gap-6 md:grid-cols-2">
          <article className="card">
            <div className="mb-4">
              <p className="label">Demanda clinica</p>
              <h3 className="mt-1 text-xl font-black">Especialidades mas solicitadas</h3>
            </div>
            <SpecialtyBars data={specialtyBreakdown} />
          </article>
          <article className="card">
            <div className="mb-4">
              <p className="label">Rendimiento</p>
              <h3 className="mt-1 text-xl font-black">Doctores con mas citas</h3>
            </div>
            <DoctorLeaderboard data={doctorLeaderboard} />
          </article>
        </section>
      )}

      {/* Agenda operativa + acciones rapidas */}
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="card overflow-hidden">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="label">Agenda operativa</p>
              <h3 className="mt-1 text-xl font-black">{isDoctor ? 'Mis proximas citas' : 'Proximas citas de la clinica'}</h3>
            </div>
            <label className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A2B4C]/35" />
              <input
                className="input pl-9 md:w-64"
                placeholder="Buscar paciente, doctor o especialidad"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          <div className="grid max-h-[520px] gap-5 overflow-y-auto pr-1">
            {Object.entries(filteredHorizons).map(([key, list]) => {
              if (list.length === 0) return null;
              const meta = HORIZON_META[key];

              return (
                <div key={key}>
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className={`text-xs font-black uppercase tracking-[0.16em] ${key === 'vencidas' ? 'text-red-600' : 'text-[#1A2B4C]/50'}`}>{meta.title}</h4>
                    <span className="rounded-full bg-[#F7F9FB] px-2 py-0.5 text-[10px] font-black text-[#1A2B4C]/50">{list.length}</span>
                  </div>
                  <div className="grid gap-2.5">
                    {list.map((appointment) => (
                      <AppointmentRow key={appointment.id} appointment={appointment} showDoctor={!isDoctor} overdue={key === 'vencidas'} />
                    ))}
                  </div>
                </div>
              );
            })}

            {totalUpcoming === 0 && (
              <div className="rounded-3xl border border-dashed border-[#B0B0B0]/40 p-8 text-center text-sm font-semibold text-[#1A2B4C]/60">
                {search ? 'Ninguna cita coincide con tu busqueda.' : 'No hay citas proximas registradas.'}
              </div>
            )}
          </div>
        </article>

        <article className="card bg-white">
          <p className="label">Accesos rapidos</p>
          <h3 className="mt-1 text-xl font-black">Acciones frecuentes</h3>
          <div className="mt-4 grid gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.to + action.label}
                to={action.to}
                className="group flex items-center gap-3 rounded-2xl border border-[#B0B0B0]/20 bg-[#F7F9FB] p-3.5 transition hover:border-[#28A745]/35 hover:bg-white hover:shadow-soft"
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white transition group-hover:scale-105 ${action.tone}`}>
                  <action.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black text-[#1A2B4C]">{action.label}</span>
                  <span className="block truncate text-xs text-[#1A2B4C]/50">{action.hint}</span>
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-[#28A745]/20 bg-[#28A745]/5 p-4 text-sm leading-6 text-[#1A2B4C]/70">
            El sistema evita duplicar citas para un mismo doctor en la misma fecha y hora, y respeta su horario de disponibilidad.
          </div>
        </article>
      </section>
    </>
  );
}
