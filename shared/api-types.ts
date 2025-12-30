// API Response Types
import type { User, Clinic, Patient, Appointment, Consultation, Referral, Notification } from './schema';

export interface LoginResponse {
  user: User;
}

export interface UserResponse {
  user: User;
}

export interface UsersResponse {
  users: User[];
}

export interface ClinicResponse {
  clinic: Clinic;
}

export interface ClinicsResponse {
  clinics: Clinic[];
}

export interface ClinicStatsResponse {
  total_patients: number;
  total_appointments: number;
  active_users: number;
}

export interface PatientResponse {
  patient: Patient;
  recent_appointments?: Appointment[];
  recent_consultations?: Consultation[];
}

export interface PatientsResponse {
  patients: Patient[];
}

export interface AppointmentResponse {
  appointment: Appointment;
  consultation?: Consultation;
}

export interface AppointmentsResponse {
  appointments: Appointment[];
}

export interface ConsultationResponse {
  consultation: Consultation;
}

export interface ConsultationsResponse {
  consultations: Consultation[];
}

export interface ReferralResponse {
  referral: Referral;
}

export interface ReferralsResponse {
  referrals: Referral[];
}

export interface NotificationResponse {
  notification: Notification;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface AdminStatsResponse {
  total_clinics: number;
  active_clinics: number;
  total_users: number;
  active_users: number;
  total_patients: number;
  total_appointments: number;
}

export interface AdminClinicsResponse {
  clinics: (Clinic & { stats: ClinicStatsResponse })[];
}

export interface SuccessResponse {
  success: boolean;
  count?: number;
}
