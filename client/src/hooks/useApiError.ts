import { useToast } from '@/hooks/use-toast';

export function useApiError() {
  const { toast } = useToast();

  return (error: unknown) => {
    const message = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';

    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  };
}
