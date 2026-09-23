import { Server } from 'lucide-react';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

export function WakeBanner() {
  return (
    <Alert data-testid="wake-banner">
      <Server aria-hidden="true" />
      <AlertTitle>Waking up the server</AlertTitle>
      <AlertDescription>
        This can take about a minute on the free tier. Keep filling in the trip while it starts.
      </AlertDescription>
      <AlertAction>
        <Spinner aria-label="Waking server" />
      </AlertAction>
    </Alert>
  );
}
