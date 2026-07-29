const DAY_LABELS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

export function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Construye los ultimos `days` dias (incluyendo hoy) con el conteo de citas de cada uno.
export function buildWeeklyTrend(appointments, days = 7, now = new Date()) {
  const today = startOfDay(now);
  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - index));
    return { date, label: DAY_LABELS[date.getDay()], count: 0, isToday: index === days - 1 };
  });

  const indexByTime = new Map(buckets.map((bucket, index) => [bucket.date.getTime(), index]));

  appointments.forEach((appointment) => {
    const day = startOfDay(appointment.appointmentAt).getTime();
    const index = indexByTime.get(day);
    if (index !== undefined) buckets[index].count += 1;
  });

  return buckets;
}

export function buildStatusBreakdown(appointments) {
  const base = { pending: 0, completed: 0, cancelled: 0 };

  appointments.forEach((appointment) => {
    if (base[appointment.status] !== undefined) base[appointment.status] += 1;
  });

  return { ...base, total: appointments.length };
}

export function buildSpecialtyBreakdown(appointments, limit = 5) {
  const counts = new Map();

  appointments.forEach((appointment) => {
    if (!appointment.specialty) return;
    counts.set(appointment.specialty, (counts.get(appointment.specialty) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([specialty, count]) => ({ specialty, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function buildDoctorLeaderboard(appointments, limit = 5) {
  const counts = new Map();

  appointments.forEach((appointment) => {
    if (!appointment.doctorName) return;
    const current = counts.get(appointment.doctorId) || { doctorName: appointment.doctorName, specialty: appointment.specialty, count: 0 };
    current.count += 1;
    counts.set(appointment.doctorId, current);
  });

  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

export function getUpcomingAppointments(appointments, now = new Date()) {
  return appointments
    .filter((appointment) => appointment.status === 'pending' && new Date(appointment.appointmentAt) >= now)
    .sort((a, b) => new Date(a.appointmentAt) - new Date(b.appointmentAt));
}

// Agrupa las citas en horizontes de tiempo legibles para la agenda del panel.
export function groupByHorizon(appointments, now = new Date()) {
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const sorted = [...appointments].sort((a, b) => new Date(a.appointmentAt) - new Date(b.appointmentAt));
  const groups = { vencidas: [], hoy: [], manana: [], semana: [], despues: [] };

  sorted.forEach((appointment) => {
    const date = new Date(appointment.appointmentAt);

    if (date < today) {
      // Solo las pendientes cuentan como "vencidas": completadas o canceladas
      // en el pasado son historial, no algo que requiera accion.
      if (appointment.status === 'pending') groups.vencidas.push(appointment);
      return;
    }

    if (date < tomorrow) groups.hoy.push(appointment);
    else if (date < dayAfterTomorrow) groups.manana.push(appointment);
    else if (date < weekEnd) groups.semana.push(appointment);
    else groups.despues.push(appointment);
  });

  return groups;
}

export function formatRelativeTime(value, now = new Date()) {
  const diffMs = new Date(value) - now;
  const diffMin = Math.round(diffMs / 60_000);

  if (diffMin <= 1) return 'en curso';
  if (diffMin < 60) return `en ${diffMin} min`;

  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `en ${diffHours} h`;

  const diffDays = Math.round(diffHours / 24);
  return `en ${diffDays} d`;
}

export function greetingFor(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Buenos dias';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

// Compara un valor contra un promedio de referencia para las tarjetas KPI.
export function buildDelta(current, average) {
  if (!average) {
    return current > 0 ? { direction: 'up', text: 'primeras citas del ciclo' } : null;
  }

  const diff = current - average;
  const pct = Math.round((diff / average) * 100);

  if (Math.abs(pct) < 5) {
    return { direction: 'flat', text: 'similar al promedio semanal' };
  }

  return { direction: diff > 0 ? 'up' : 'down', text: `${diff > 0 ? '+' : ''}${pct}% vs. promedio semanal` };
}
