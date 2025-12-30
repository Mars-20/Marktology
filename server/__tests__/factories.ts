import { randomUUID } from 'crypto';
import type { User, Clinic, Patient, Appointment } from '@shared/types';

export function createTestUser(overrides?: Partial<User>): User {
  return {
    id: randomUUID(),
    username: `testuser_${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'hashed_password',
    role: 'doctor',
    clinic_id: randomUUID(),
    full_name: 'Test User',
    first_name: 'Test',
    last_name: 'User',
    phone: '+1234567890',
    status: 'active',
    specialization: null,
    registration_method: 'clinic_owner',
    is_first_login: false,
    last_login_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

export function createTestClinic(overrides?: Partial<Clinic>): Clinic {
  const id = randomUUID();
  return {
    id,
    name: `Test Clinic ${Date.now()}`,
    address: '123 Test St',
    phone: '+1234567890',
    email: `clinic${Date.now()}@example.com`,
    status: 'active',
    specialty: null,
    license_number: null,
    registration_date: new Date(),
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

export function createTestPatient(overrides?: Partial<Patient>): Patient {
  return {
    id: randomUUID(),
    clinic_id: randomUUID(),
    file_number: `FN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
    full_name: 'Test Patient',
    date_of_birth: '1990-01-01',
    gender: 'male',
    phone: '+1234567890',
    email: `patient${Date.now()}@example.com`,
    address: '456 Patient Ave',
    blood_type: 'O+',
    chronic_diseases: null,
    allergies: null,
    current_medications: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

export function createTestAppointment(overrides?: Partial<Appointment>): Appointment {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  return {
    id: randomUUID(),
    clinic_id: randomUUID(),
    patient_id: randomUUID(),
    doctor_id: randomUUID(),
    appointment_date: dateStr,
    appointment_time: '10:00',
    duration: 30,
    status: 'scheduled',
    notes: null,
    created_by: randomUUID(),
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}
