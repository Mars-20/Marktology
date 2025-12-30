-- Add new enums
DO $$ BEGIN
  CREATE TYPE communication_type AS ENUM ('phone_call', 'whatsapp', 'sms', 'email', 'in_person');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE communication_status AS ENUM ('successful', 'failed', 'no_answer', 'scheduled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE file_type AS ENUM ('lab_result', 'radiology', 'prescription', 'report', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS chronic_diseases JSONB,
ADD COLUMN IF NOT EXISTS allergies JSONB,
ADD COLUMN IF NOT EXISTS current_medications JSONB,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- Create patient_files table
CREATE TABLE IF NOT EXISTS patient_files (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id VARCHAR NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  file_type file_type NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  description TEXT,
  uploaded_by VARCHAR NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_files_patient ON patient_files(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_files_clinic ON patient_files(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_files_type ON patient_files(file_type);

-- Create communication_logs table
CREATE TABLE IF NOT EXISTS communication_logs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id VARCHAR NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  communication_type communication_type NOT NULL,
  status communication_status NOT NULL,
  subject TEXT,
  notes TEXT,
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_communication_logs_patient ON communication_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_clinic ON communication_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_user ON communication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_created_at ON communication_logs(created_at);

-- Create follow_up_tasks table
CREATE TABLE IF NOT EXISTS follow_up_tasks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultation_id VARCHAR REFERENCES consultations(id) ON DELETE CASCADE,
  clinic_id VARCHAR NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_id VARCHAR NOT NULL REFERENCES users(id),
  due_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP,
  completed_by VARCHAR REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_patient ON follow_up_tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_clinic ON follow_up_tasks(clinic_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_doctor ON follow_up_tasks(doctor_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_due_date ON follow_up_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_completed ON follow_up_tasks(is_completed);

-- Add comments for documentation
COMMENT ON TABLE patient_files IS 'Stores patient medical files (lab results, radiology, prescriptions, etc.)';
COMMENT ON TABLE communication_logs IS 'Logs all communications between clinic staff and patients';
COMMENT ON TABLE follow_up_tasks IS 'Tracks follow-up tasks for patients after consultations';
