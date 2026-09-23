import { useQuery } from '@tanstack/react-query';
import { Server, ServerOff } from 'lucide-react';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

import { serverHealthQuery } from './useServerStatus';

export function WakeBanner() {
  const health = useQuery(serverHealthQuery);

  if (health.isError) {
    return (
      <Alert data-testid="wake-banner" variant="destructive">
        <ServerOff aria-hidden="true" />
        <AlertTitle>We could not reach the planning server</AlertTitle>
        <AlertDescription>
          It may still be starting. Keep filling in the trip and plan it when you are ready.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert data-testid="wake-banner">
      <Server aria-hidden="true" />
      <AlertTitle>Waking up the server (≈1 min on the free tier)…</AlertTitle>
      <AlertDescription>Keep filling in the trip while it starts.</AlertDescription>
      <AlertAction>
        <Spinner aria-label="Waking server" />
      </AlertAction>
    </Alert>
  );
}
