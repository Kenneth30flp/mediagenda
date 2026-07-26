CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'admin',
  access_level VARCHAR(20) NOT NULL DEFAULT 'editor',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_role_check CHECK (role IN ('admin', 'recepcion', 'doctor', 'asistente')),
  CONSTRAINT users_access_level_check CHECK (access_level IN ('editor', 'reader'))
);

CREATE TABLE IF NOT EXISTS patients (
  id BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  document_id VARCHAR(50) NOT NULL UNIQUE,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  birth_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
  id BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  specialty VARCHAR(120) NOT NULL,
  medical_license VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(160) NOT NULL UNIQUE,
  availability TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS doctor_id BIGINT REFERENCES doctors(id);

CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patients(id),
  doctor_id BIGINT NOT NULL REFERENCES doctors(id),
  appointment_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT appointments_status_check CHECK (status IN ('pending', 'completed', 'cancelled')),
  CONSTRAINT appointments_doctor_time_unique UNIQUE (doctor_id, appointment_at)
);

CREATE INDEX IF NOT EXISTS idx_patients_search ON patients(first_name, last_name, document_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_at);

INSERT INTO users (name, email, password_hash, role)
VALUES ('Administrador', 'admin@clinica.com', crypt('Admin123', gen_salt('bf', 12)), 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO patients (first_name, last_name, document_id, phone, email, birth_date)
VALUES
  ('Ana', 'Martinez', 'P-1001', '555-0101', 'ana.martinez@example.com', '1990-04-12'),
  ('Carlos', 'Ramirez', 'P-1002', '555-0102', 'carlos.ramirez@example.com', '1985-09-20')
ON CONFLICT DO NOTHING;

INSERT INTO doctors (first_name, last_name, specialty, medical_license, email, availability)
VALUES
  ('Laura', 'Gomez', 'Cardiologia', 'MED-7781', 'laura.gomez@example.com', 'Lunes a viernes, 08:00-14:00'),
  ('Miguel', 'Santos', 'Pediatria', 'MED-8820', 'miguel.santos@example.com', 'Martes y jueves, 10:00-16:00')
ON CONFLICT DO NOTHING;
