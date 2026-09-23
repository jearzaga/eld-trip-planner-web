import type { ReactNode } from 'react';

import type { DailyLog } from '@/features/trip-results/schema';

type RecapData = DailyLog['recap'];

function RecapCell({ label, value, testId }: { label: string; value?: number; testId?: string }) {
  return (
    <div>
      <p data-testid={testId} className="border-foreground min-h-6 border-b text-sm font-bold">
        {value}
      </p>
      <p className="mt-1 text-[0.65rem] leading-tight">{label}</p>
    </div>
  );
}

function DriverGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      role="group"
      aria-label={title}
      className="grid grid-cols-2 gap-3 sm:auto-cols-fr sm:grid-flow-col sm:grid-cols-[4.5rem]"
    >
      <p className="col-span-2 text-xs font-bold sm:col-span-1">{title}</p>
      {children}
    </div>
  );
}

export function Recap({ recap }: { recap: RecapData }) {
  return (
    <section className="border-foreground grid gap-4 border-t-2 pt-3 sm:grid-cols-[6rem_minmax(0,5fr)_minmax(0,4fr)_7rem]">
      <p className="text-xs font-bold">Recap: Complete at end of day</p>
      <DriverGroup title="70 Hour/8 Day Drivers">
        <RecapCell
          label="On duty hours today, Total lines 3 & 4"
          value={recap.on_duty_today}
          testId="recap-on-duty-today"
        />
        <RecapCell
          label="A. Total hours on duty last 7 days including today."
          value={recap.a_last_7}
          testId="recap-a"
        />
        <RecapCell
          label="B. Total hours available tomorrow 70 hr. minus A*"
          value={recap.b_available_tomorrow}
          testId="recap-b"
        />
        <RecapCell
          label="C. Total hours on duty last 5 days including today."
          value={recap.c_last_5}
          testId="recap-c"
        />
      </DriverGroup>
      <DriverGroup title="60 Hour/7 Day Drivers">
        <RecapCell label="A. Total hours on duty last 7 days including today." />
        <RecapCell label="B. Total hours available tomorrow 60 hr. minus A*" />
        <RecapCell label="C. Total hours on duty last 8 days including today." />
      </DriverGroup>
      <p className="text-[0.65rem] leading-tight">
        *If you took 34 consecutive hours off duty you have 60/70 hours available
      </p>
      {recap.restart_34_taken ? (
        <p data-testid="recap-restart-note" className="text-xs font-semibold sm:col-span-4">
          34-hour restart taken — cycle availability reset by the trip plan.
        </p>
      ) : null}
    </section>
  );
}
