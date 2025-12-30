import type {
  LoginResponse,
  UserResponse,
  UsersResponse,
  ClinicResponse,
  ClinicsResponse,
  ClinicStatsResponse,
  PatientResponse,
  PatientsResponse,
  AppointmentResponse,
  AppointmentsResponse,
  ConsultationResponse,
  ConsultationsResponse,
  ReferralResponse,
  ReferralsResponse,
  NotificationResponse,
  NotificationsResponse,
  AdminStatsResponse,
  AdminClinicsResponse,
  SuccessResponse,
} from '@shared/api-types';

const API_BASE = '/api';

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // Important for session cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (credentials: { username: string; password: string }) =>
      fetchAPI<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    logout: () => fetchAPI<SuccessResponse>('/auth/logout', { method: 'POST' }),
    me: () => fetchAPI<UserResponse>('/auth/me'),
  },

  users: {
    list: (params?: { clinic_id?: string; role?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return fetchAPI<UsersResponse>(`/users${query ? `?${query}` : ''}`);
    },
    get: (id: string) => fetchAPI<UserResponse>(`/users/${id}`),
    create: (data: any) =>
      fetchAPI<UserResponse>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI<UserResponse>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI<SuccessResponse>(`/users/${id}`, {
        method: 'DELETE',
      }),
  },

  clinics: {
    list: () => fetchAPI<ClinicsResponse>('/clinics'),
    get: (id: string) => fetchAPI<ClinicResponse>(`/clinics/${id}`),
    create: (data: any) =>
      fetchAPI<ClinicResponse>('/clinics', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI<ClinicResponse>(`/clinics/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    stats: (id: string) => fetchAPI<ClinicStatsResponse>(`/clinics/${id}/stats`),
  },

  patients: {
    list: (clinicId: string, params?: { search?: string; status?: string }) => {
      const query = new URLSearchParams({ clinic_id: clinicId, ...params } as any).toString();
      return fetchAPI<PatientsResponse>(`/patients?${query}`);
    },
    get: (id: string) => fetchAPI<PatientResponse>(`/patients/${id}`),
    create: (data: any) =>
      fetchAPI<PatientResponse>('/patients', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI<PatientResponse>(`/patients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI<SuccessResponse>(`/patients/${id}`, {
        method: 'DELETE',
      }),
  },

  appointments: {
    list: (clinicId: string, params?: {
      date?: string;
      doctor_id?: string;
      patient_id?: string;
      start_date?: string;
      end_date?: string;
    }) => {
      const query = new URLSearchParams({ clinic_id: clinicId, ...params } as any).toString();
      return fetchAPI<AppointmentsResponse>(`/appointments?${query}`);
    },
    get: (id: string) => fetchAPI<AppointmentResponse>(`/appointments/${id}`),
    create: (data: any) =>
      fetchAPI<AppointmentResponse>('/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI<AppointmentResponse>(`/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI<SuccessResponse>(`/appointments/${id}`, {
        method: 'DELETE',
      }),
    start: (id: string) =>
      fetchAPI<AppointmentResponse>(`/appointments/${id}/start`, {
        method: 'POST',
      }),
    complete: (id: string) =>
      fetchAPI<AppointmentResponse>(`/appointments/${id}/complete`, {
        method: 'POST',
      }),
  },

  consultations: {
    list: (clinicId: string, params?: { patient_id?: string; doctor_id?: string }) => {
      const query = new URLSearchParams({ clinic_id: clinicId, ...params } as any).toString();
      return fetchAPI<ConsultationsResponse>(`/consultations?${query}`);
    },
    get: (id: string) => fetchAPI<ConsultationResponse>(`/consultations/${id}`),
    create: (data: any) =>
      fetchAPI<ConsultationResponse>('/consultations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI<ConsultationResponse>(`/consultations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  referrals: {
    list: (clinicId: string, params?: { patient_id?: string; status?: string }) => {
      const query = new URLSearchParams({ clinic_id: clinicId, ...params } as any).toString();
      return fetchAPI<ReferralsResponse>(`/referrals?${query}`);
    },
    create: (data: any) =>
      fetchAPI<ReferralResponse>('/referrals', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchAPI<ReferralResponse>(`/referrals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  notifications: {
    list: (userId: string, params?: { is_read?: boolean }) => {
      const query = new URLSearchParams({ user_id: userId, ...params } as any).toString();
      return fetchAPI<NotificationsResponse>(`/notifications?${query}`);
    },
    markRead: (id: string) =>
      fetchAPI<NotificationResponse>(`/notifications/${id}/read`, {
        method: 'PATCH',
      }),
    markAllRead: (userId: string) =>
      fetchAPI<SuccessResponse>('/notifications/read-all', {
        method: 'PATCH',
        body: JSON.stringify({ user_id: userId }),
      }),
  },

  admin: {
    clinics: () => fetchAPI<AdminClinicsResponse>('/admin/clinics'),
    users: () => fetchAPI<UsersResponse>('/admin/users'),
    activateClinic: (id: string, notes?: string) =>
      fetchAPI<ClinicResponse>(`/admin/clinics/${id}/activate`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      }),
    rejectClinic: (id: string, reason: string) =>
      fetchAPI<ClinicResponse>(`/admin/clinics/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    suspendClinic: (id: string, reason: string) =>
      fetchAPI<ClinicResponse>(`/admin/clinics/${id}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    resetPassword: (id: string, newPassword: string) =>
      fetchAPI<SuccessResponse>(`/admin/users/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ new_password: newPassword }),
      }),
    stats: () => fetchAPI<AdminStatsResponse>('/admin/stats'),
  },
};
