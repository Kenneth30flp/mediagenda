-- Los listados de citas filtran por doctor y unen contra pacientes/doctores.
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- El login busca por email y solo usuarios activos.
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email) WHERE is_active = true;
