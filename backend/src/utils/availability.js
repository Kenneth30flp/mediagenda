const dayMap = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6
};

function normalize(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/sabados/g, 'sabado')
    .replace(/domingos/g, 'domingo')
    .trim();
}

function parseMinutes(hour, minute) {
  return Number(hour) * 60 + Number(minute);
}

function parseDayExpression(expression) {
  const text = normalize(expression);

  const rangeMatch = text.match(/(domingo|lunes|martes|miercoles|jueves|viernes|sabado)\s+a\s+(domingo|lunes|martes|miercoles|jueves|viernes|sabado)/);
  if (rangeMatch) {
    const start = dayMap[rangeMatch[1]];
    const end = dayMap[rangeMatch[2]];
    const days = [];
    let current = start;

    while (true) {
      days.push(current);
      if (current === end) break;
      current = (current + 1) % 7;
    }

    return days;
  }

  return Object.keys(dayMap)
    .filter((day) => new RegExp(`\\b${day}\\b`).test(text))
    .map((day) => dayMap[day]);
}

function getClinicDateParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);

  return {
    weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
    minutes: Number(values.hour) * 60 + Number(values.minute)
  };
}

export function isWithinDoctorAvailability(availability, appointmentAt, timeZone) {
  const text = normalize(availability || '');
  const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);

  if (!timeMatch) {
    return { valid: false, reason: 'El horario del doctor no tiene un rango de horas valido' };
  }

  const days = parseDayExpression(text.split(',')[0] || text);
  if (days.length === 0) {
    return { valid: false, reason: 'El horario del doctor no tiene dias validos' };
  }

  const startMinutes = parseMinutes(timeMatch[1], timeMatch[2]);
  const endMinutes = parseMinutes(timeMatch[3], timeMatch[4]);
  const clinicDate = getClinicDateParts(new Date(appointmentAt), timeZone);

  const dayAllowed = days.includes(clinicDate.weekday);
  const hourAllowed = clinicDate.minutes >= startMinutes && clinicDate.minutes < endMinutes;

  return {
    valid: dayAllowed && hourAllowed,
    reason: `El doctor solo esta disponible en este horario: ${availability}`
  };
}
