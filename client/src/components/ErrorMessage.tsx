import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorMessageProps {
  error: Error | unknown;
  title?: string;
}

export function ErrorMessage({ error, title = 'Error' }: ErrorMessageProps) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
