import { Separator } from '@/components/ui/separator';
import type { DailyLog } from '@/features/trip-results/schema';
import { cn } from '@/lib/utils';

import { LogGrid } from './LogGrid';
import { LogHeader } from './LogHeader';
import { Recap } from './Recap';
import { Remarks } from './Remarks';

export function LogSheet({ log, visible }: { log: DailyLog; visible: boolean }) {
  return (
    <article
      data-testid="log-sheet"
      data-day={log.day_number}
      hidden={!visible}
      className={cn(
        'log-sheet bg-background text-foreground ring-foreground/20 mx-auto w-full max-w-[68rem] p-5 ring-1 sm:p-8',
        visible && 'block',
      )}
    >
      <LogHeader log={log} />
      <Separator className="my-5" />
      <LogGrid log={log} />
      <Remarks log={log} />
      <div className="mt-5">
        <Recap recap={log.recap} />
      </div>
    </article>
  );
}
