ALTER TABLE users
ADD COLUMN IF NOT EXISTS access_level VARCHAR(20) NOT NULL DEFAULT 'editor';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS doctor_id BIGINT REFERENCES doctors(id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_access_level_check'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_access_level_check CHECK (access_level IN ('editor', 'reader'));
  END IF;
END $$;
