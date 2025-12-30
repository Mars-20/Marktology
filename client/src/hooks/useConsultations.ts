import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useConsultations(
  clinicId: string,
  params?: { patient_id?: string; doctor_id?: string }
) {
  return useQuery({
    queryKey: ['consultations', clinicId, params],
    queryFn: () => api.consultations.list(clinicId, params),
    enabled: !!clinicId,
  });
}

export function useConsultation(id: string) {
  return useQuery({
    queryKey: ['consultations', id],
    queryFn: () => api.consultations.get(id),
    enabled: !!id,
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.consultations.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
}

export function useUpdateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.consultations.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['consultations', variables.id] });
    },
  });
}
