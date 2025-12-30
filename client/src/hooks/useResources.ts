import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Users
export function useUsers(params?: { clinic_id?: string; role?: string }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => api.users.list(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => api.users.get(id),
    enabled: !!id,
  });
}

// Clinics
export function useClinics() {
  return useQuery({
    queryKey: ['clinics'],
    queryFn: api.clinics.list,
  });
}

export function useClinic(id: string) {
  return useQuery({
    queryKey: ['clinics', id],
    queryFn: () => api.clinics.get(id),
    enabled: !!id,
  });
}

export function useClinicStats(id: string) {
  return useQuery({
    queryKey: ['clinics', id, 'stats'],
    queryFn: () => api.clinics.stats(id),
    enabled: !!id,
  });
}

// Referrals
export function useReferrals(
  clinicId: string,
  params?: { patient_id?: string; status?: string }
) {
  return useQuery({
    queryKey: ['referrals', clinicId, params],
    queryFn: () => api.referrals.list(clinicId, params),
    enabled: !!clinicId,
  });
}

export function useCreateReferral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.referrals.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });
}

export function useUpdateReferral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.referrals.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });
}

// Notifications
export function useNotifications(userId: string, params?: { is_read?: boolean }) {
  return useQuery({
    queryKey: ['notifications', userId, params],
    queryFn: () => api.notifications.list(userId, params),
    enabled: !!userId,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.notifications.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.notifications.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Admin
export function useAdminClinics() {
  return useQuery({
    queryKey: ['admin', 'clinics'],
    queryFn: api.admin.clinics,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: api.admin.users,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: api.admin.stats,
  });
}
