import { query } from '../config/db.js';

const appointmentSelect = `
  a.id,
  a.patient_id AS "patientId",
  a.doctor_id AS "doctorId",
  a.appointment_at AS "appointmentAt",
  a.status,
  CONCAT(p.first_name, ' ', p.last_name) AS "patientName",
  CONCAT(d.first_name, ' ', d.last_name) AS "doctorName",
  d.specialty
`;

export async function listAppointments(user) {
  const isDoctor = user?.role === 'doctor';
  const result = await query(
    `SELECT ${appointmentSelect}
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     JOIN doctors d ON d.id = a.doctor_id
     WHERE ($1::boolean = false OR a.doctor_id = $2)
     ORDER BY a.appointment_at DESC`,
    [isDoctor, user?.doctorId || null]
  );
  return result.rows;
}

// La FK solo garantiza que el registro exista: hay que comprobar aparte que
// paciente y doctor sigan activos, si no se pueden agendar citas con fichas
// que ya fueron desactivadas.
async function assertActiveParticipants(patientId, doctorId) {
  const result = await query(
    `SELECT
       (SELECT is_active FROM patients WHERE id = $1) AS "patientActive",
       (SELECT is_active FROM doctors WHERE id = $2) AS "doctorActive"`,
    [patientId, doctorId]
  );

  const { patientActive, doctorActive } = result.rows[0];

  if (patientActive === null) {
    throw Object.assign(new Error('El paciente seleccionado no existe'), { status: 400 });
  }

  if (doctorActive === null) {
    throw Object.assign(new Error('El doctor seleccionado no existe'), { status: 400 });
  }

  if (!patientActive) {
    throw Object.assign(new Error('El paciente seleccionado esta desactivado'), { status: 400 });
  }

  if (!doctorActive) {
    throw Object.assign(new Error('El doctor seleccionado esta desactivado'), { status: 400 });
  }
}

export async function createAppointment(data) {
  await assertActiveParticipants(data.patientId, data.doctorId);

  const result = await query(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_at, status)
     VALUES ($1, $2, $3, COALESCE($4, 'pending'))
     RETURNING id`,
    [data.patientId, data.doctorId, data.appointmentAt, data.status]
  );
  return findAppointmentById(result.rows[0].id);
}

export async function updateAppointmentStatus(id, status, user) {
  const isDoctor = user?.role === 'doctor';
  const result = await query(
    `UPDATE appointments
     SET status = $1
     WHERE id = $2 AND ($3::boolean = false OR doctor_id = $4)
     RETURNING id`,
    [status, id, isDoctor, user?.doctorId || null]
  );
  return result.rowCount > 0 ? findAppointmentById(id) : null;
}

export async function findAppointmentById(id) {
  const result = await query(
    `SELECT ${appointmentSelect}
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     JOIN doctors d ON d.id = a.doctor_id
     WHERE a.id = $1`,
    [id]
  );
  return result.rows[0];
}
