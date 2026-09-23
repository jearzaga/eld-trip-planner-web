import type { DailyLog } from '@/features/trip-results/schema';

import { formatLogHours } from './format';

type RecapData = DailyLog['recap'];

function RecapValue({ label, value, testId }: { label: string; value: number; testId: string }) {
  return (
    <div className="border-foreground border-t pt-1">
      <p data-testid={testId} className="text-sm font-bold">
        {formatLogHours(value)}
      </p>
      <p className="text-[0.65rem] leading-tight">{label}</p>
    </div>
  );
}

export function Recap({ recap }: { recap: RecapData }) {
  return (
    <section className="border-foreground grid gap-3 border-t-2 pt-3 sm:grid-cols-[9rem_1fr]">
      <div>
        <h4 className="text-sm font-bold">Recap</h4>
        <p className="text-[0.65rem]">Complete at end of day</p>
      </div>
      <div>
        <h4 className="text-sm font-bold">70 Hour / 8 Day</h4>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <RecapValue
            label="On duty hours today"
            value={recap.on_duty_today}
            testId="recap-on-duty-today"
          />
          <RecapValue
            label="A. Total hours on duty last 7 days including today"
            value={recap.a_last_7}
            testId="recap-a"
          />
          <RecapValue
            label="B. Total hours available tomorrow"
            value={recap.b_available_tomorrow}
            testId="recap-b"
          />
          <RecapValue
            label="C. Total hours on duty last 5 days including today"
            value={recap.c_last_5}
            testId="recap-c"
          />
        </div>
        {recap.restart_34_taken ? (
          <p data-testid="recap-restart-note" className="mt-3 text-xs font-semibold">
            34-hour restart taken — cycle availability reset by the trip plan.
          </p>
        ) : null}
      </div>
    </section>
  );
}
