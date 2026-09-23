import { Server } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

export function WakeBanner() {
  return (
    <Alert data-testid="wake-banner" className="border-primary/20 bg-primary/5">
      <Server aria-hidden="true" />
      <AlertTitle className="flex items-center gap-2">
        Waking the planning server <Spinner />
      </AlertTitle>
      <AlertDescription>
        The first request can take a moment. You can keep filling in the trip while it starts.
      </AlertDescription>
    </Alert>
  );
}
