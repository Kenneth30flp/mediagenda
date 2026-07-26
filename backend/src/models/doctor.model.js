import { query } from '../config/db.js';

const doctorFields = `
  id,
  first_name AS "firstName",
  last_name AS "lastName",
  specialty,
  medical_license AS "medicalLicense",
  email,
  availability,
  is_active AS "isActive",
  created_at AS "createdAt"
`;

export async function listDoctors(specialty = '') {
  const result = await query(
    `SELECT ${doctorFields}
     FROM doctors
     WHERE is_active = true AND ($1 = '' OR specialty ILIKE $2)
     ORDER BY first_name ASC`,
    [specialty, `%${specialty}%`]
  );
  return result.rows;
}

export async function listInactiveDoctors() {
  const result = await query(
    `SELECT ${doctorFields}
     FROM doctors
     WHERE is_active = false
     ORDER BY first_name ASC`
  );
  return result.rows;
}

export async function createDoctor(data) {
  const result = await query(
    `INSERT INTO doctors (first_name, last_name, specialty, medical_license, email, availability)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${doctorFields}`,
    [data.firstName, data.lastName, data.specialty, data.medicalLicense, data.email, data.availability]
  );
  return result.rows[0];
}

export async function updateDoctor(id, data) {
  const result = await query(
    `UPDATE doctors
     SET first_name = $1, last_name = $2, specialty = $3, medical_license = $4, email = $5, availability = $6
     WHERE id = $7 AND is_active = true
     RETURNING ${doctorFields}`,
    [data.firstName, data.lastName, data.specialty, data.medicalLicense, data.email, data.availability, id]
  );
  return result.rows[0];
}

export async function deactivateDoctor(id) {
  const result = await query('UPDATE doctors SET is_active = false WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}

export async function activateDoctor(id) {
  const result = await query('UPDATE doctors SET is_active = true WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}
