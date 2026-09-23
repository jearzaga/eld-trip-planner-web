import { useEffect, useState } from 'react';
import { Route, ScrollText, ShieldCheck } from 'lucide-react';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

const stages = [
  { label: 'Routing your trip…', icon: Route },
  { label: 'Applying hours-of-service rules…', icon: ShieldCheck },
  { label: 'Drawing driver logs…', icon: ScrollText },
] as const;

export function PlanningLoader() {
  const [stage, setStage] = useState(0);
  const current = stages[Math.min(stage, stages.length - 1)];
  const Icon = current.icon;

  useEffect(() => {
    const applyingRules = window.setTimeout(() => setStage(1), 1_200);
    const preparingLogs = window.setTimeout(() => setStage(2), 2_500);
    return () => {
      window.clearTimeout(applyingRules);
      window.clearTimeout(preparingLogs);
    };
  }, []);

  return (
    <Alert data-testid="planning-loader" aria-live="polite">
      <Icon aria-hidden="true" />
      <AlertTitle>{current.label}</AlertTitle>
      <AlertDescription>This usually finishes in a few seconds.</AlertDescription>
      <AlertAction>
        <Spinner aria-label="Planning trip" />
      </AlertAction>
    </Alert>
  );
}
