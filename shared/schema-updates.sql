-- Migration: Add MVP Missing Features
-- Date: 2025-12-30

-- Add new enums
CREATE TYPE communication_type AS ENUM ('call', 'whatsapp', 'sms', 'email', 'in_person');
CREATE TYPE communication_status AS ENUM ('successful', 'failed', 'no_answer', 'scheduled');
CREATE TYPE file_type AS ENUM ('lab_result', 'radiology', 'prescription', 'report', 'other');

-- Add medical history fields to patients table
ALTER TABLE patients 
ADD COLUMN chronic_diseases JSONB,
ADD COLUMN allergies JSONB,
ADD COLUMN current_medications JSONB,
ADD COLUMN medical_notes TEXT;

-- Create communication_logs table
CREATE TABLE communication_logs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type communication_type NOT NULL,
  status communication_status NOT NULL,
  notes TEXT,
  scheduled_for TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_communication_logs_patient ON communication_logs(patient_id);
CREATE INDEX idx_communication_logs_user ON communication_logs(user_id);
CREATE INDEX idx_communication_logs_scheduled ON communication_logs(scheduled_for);

-- Create patient_files table
CREATE TABLE patient_files (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultation_id VARCHAR REFERENCES consultations(id) ON DELETE SET NULL,
  uploaded_by VARCHAR NOT NULL REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_type file_type NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patient_files_patient ON patient_files(patient_id);
CREATE INDEX idx_patient_files_consultation ON patient_files(consultation_id);
CREATE INDEX idx_patient_files_type ON patient_files(file_type);

-- Create follow_up_tasks table
CREATE TABLE follow_up_tasks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id VARCHAR NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  patient_id VARCHAR NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP,
  completed_by VARCHAR REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_follow_up_tasks_patient ON follow_up_tasks(patient_id);
CREATE INDEX idx_follow_up_tasks_doctor ON follow_up_tasks(doctor_id);
CREATE INDEX idx_follow_up_tasks_due_date ON follow_up_tasks(due_date);
CREATE INDEX idx_follow_up_tasks_completed ON follow_up_tasks(is_completed);
