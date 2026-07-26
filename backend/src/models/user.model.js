import { query } from '../config/db.js';

export async function findUserByEmail(email) {
  const result = await query(
    `SELECT id, name, email, password_hash, role, access_level AS "accessLevel", doctor_id AS "doctorId"
     FROM users
     WHERE email = $1 AND is_active = true`,
    [email]
  );
  return result.rows[0];
}

export async function findUserById(id) {
  const result = await query(
    `SELECT ${userFields} FROM users WHERE id = $1 AND is_active = true`,
    [id]
  );
  return result.rows[0];
}

export async function findUserWithPasswordById(id) {
  const result = await query(
    `SELECT id, name, email, password_hash, role, access_level AS "accessLevel", doctor_id AS "doctorId"
     FROM users
     WHERE id = $1 AND is_active = true`,
    [id]
  );
  return result.rows[0];
}

const userFields = 'id, name, email, role, access_level AS "accessLevel", doctor_id AS "doctorId", is_active AS "isActive", created_at AS "createdAt"';

export async function listUsers() {
  const result = await query(
    `SELECT ${userFields} FROM users WHERE is_active = true ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function createUser(data) {
  const result = await query(
    `INSERT INTO users (name, email, password_hash, role, access_level, doctor_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${userFields}`,
    [data.name, data.email, data.passwordHash, data.role, data.accessLevel, data.doctorId || null]
  );
  return result.rows[0];
}

export async function updateUserAccess(id, data) {
  const result = await query(
    `UPDATE users
     SET role = $1, access_level = $2, doctor_id = $3
     WHERE id = $4 AND is_active = true
     RETURNING ${userFields}`,
    [data.role, data.accessLevel, data.doctorId || null, id]
  );
  return result.rows[0];
}

export async function deactivateUser(id) {
  const result = await query('UPDATE users SET is_active = false WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}

export async function updateOwnProfile(id, data) {
  const result = await query(
    `UPDATE users
     SET name = $1, email = $2
     WHERE id = $3 AND is_active = true
     RETURNING ${userFields}`,
    [data.name, data.email, id]
  );
  return result.rows[0];
}

export async function updateOwnPassword(id, passwordHash) {
  const result = await query(
    'UPDATE users SET password_hash = $1 WHERE id = $2 AND is_active = true RETURNING id',
    [passwordHash, id]
  );
  return result.rowCount > 0;
}
