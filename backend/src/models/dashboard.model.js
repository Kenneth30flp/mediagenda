import { query } from '../config/db.js';

export async function getDashboardMetrics() {
  const result = await query(`
    SELECT
      (SELECT COUNT(*)::int FROM patients WHERE is_active = true) AS "totalPatients",
      (SELECT COUNT(*)::int FROM doctors WHERE is_active = true) AS "activeDoctors",
      (SELECT COUNT(*)::int FROM appointments WHERE appointment_at::date = CURRENT_DATE) AS "todayAppointments"
  `);
  return result.rows[0];
}
