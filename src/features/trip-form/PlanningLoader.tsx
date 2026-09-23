import { useEffect, useState } from 'react';
import { Route, ScrollText, ShieldCheck } from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';

const stages = [
  { label: 'Routing your trip…', icon: Route },
  { label: 'Applying hours-of-service rules…', icon: ShieldCheck },
  { label: 'Preparing driver logs…', icon: ScrollText },
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
    <div
      data-testid="planning-loader"
      className="bg-muted/50 flex items-center gap-3 rounded-lg border p-3"
      aria-live="polite"
    >
      <div className="bg-background flex size-9 items-center justify-center rounded-lg border">
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div>
          <p className="font-medium">{current.label}</p>
          <p className="text-muted-foreground text-xs">This usually finishes in a few seconds.</p>
        </div>
        <Spinner className="size-5" />
      </div>
    </div>
  );
}
