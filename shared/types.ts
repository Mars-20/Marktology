// Re-export types from schema for convenience
export type {
  User,
  InsertUser,
  Clinic,
  InsertClinic,
  Patient,
  InsertPatient,
  Appointment,
  InsertAppointment,
  Consultation,
  InsertConsultation,
  Referral,
  InsertReferral,
  Notification,
  InsertNotification,
} from './schema';

// Additional type definitions
export type UserRole = 'doctor' | 'nurse' | 'clinic_owner' | 'system_admin';
export type AppointmentType = 'consultation' | 'follow_up' | 'check_up';
export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type PatientStatus = 'active' | 'inactive';
export type Gender = 'male' | 'female' | 'other';
export type ReferralStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';
export type NotificationType = 'appointment' | 'referral' | 'system' | 'reminder';
export type SubscriptionStatus = 'trial' | 'active' | 'suspended';

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface VitalSigns {
  temperature?: number;
  blood_pressure?: string;
  heart_rate?: number;
  weight?: number;
  height?: number;
}
