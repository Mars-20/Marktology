import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useLocation } from 'wouter';

export function useLogin() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.auth.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
      // Redirect based on role
      if (data.user.role === 'system_admin') {
        setLocation('/admin-dashboard');
      } else {
        setLocation('/dashboard');
      }
    },
  });
}

export function useLogout() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      queryClient.clear();
      setLocation('/');
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: api.auth.me,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
