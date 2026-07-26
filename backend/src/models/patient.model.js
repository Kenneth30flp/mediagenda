import { query } from '../config/db.js';

const patientFields = `
  id,
  first_name AS "firstName",
  last_name AS "lastName",
  document_id AS "documentId",
  phone,
  email,
  birth_date AS "birthDate",
  is_active AS "isActive",
  created_at AS "createdAt"
`;

export async function listPatients(search = '') {
  const pattern = `%${search}%`;
  const result = await query(
    `SELECT ${patientFields}
     FROM patients
     WHERE is_active = true
       AND ($1 = '' OR first_name ILIKE $2 OR last_name ILIKE $2 OR document_id ILIKE $2)
     ORDER BY created_at DESC`,
    [search, pattern]
  );
  return result.rows;
}

export async function createPatient(data) {
  const result = await query(
    `INSERT INTO patients (first_name, last_name, document_id, phone, email, birth_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${patientFields}`,
    [data.firstName, data.lastName, data.documentId, data.phone, data.email, data.birthDate]
  );
  return result.rows[0];
}

export async function updatePatient(id, data) {
  const result = await query(
    `UPDATE patients
     SET first_name = $1, last_name = $2, document_id = $3, phone = $4, email = $5, birth_date = $6
     WHERE id = $7 AND is_active = true
     RETURNING ${patientFields}`,
    [data.firstName, data.lastName, data.documentId, data.phone, data.email, data.birthDate, id]
  );
  return result.rows[0];
}

export async function deactivatePatient(id) {
  const result = await query(
    `UPDATE patients SET is_active = false WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rowCount > 0;
}
