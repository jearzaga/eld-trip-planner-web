import { useState } from 'react';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TripPlan } from '@/features/trip-results/schema';
import { useUiStore } from '@/stores/ui-store';

import { LogSheet } from './LogSheet';

type ActiveView = number | 'all';

export function LogSheetPager({ trip }: { trip: TripPlan }) {
  const activeLogDay = useUiStore((state) => state.activeLogDay);
  const setActiveLogDay = useUiStore((state) => state.setActiveLogDay);
  const [activeView, setActiveView] = useState<ActiveView>(activeLogDay);
  const lastDay = trip.daily_logs.length;

  const selectView = (value: string) => {
    if (value === 'all') {
      setActiveView('all');
      return;
    }
    const day = Number(value);
    setActiveView(day);
    setActiveLogDay(day);
  };

  const selectDay = (day: number) => {
    setActiveView(day);
    setActiveLogDay(day);
  };

  return (
    <Card className="print-log-region print-log-card">
      <CardHeader>
        <CardTitle>Daily log sheets</CardTitle>
        <CardDescription>
          Review each calendar day or print all sheets in landscape format.
        </CardDescription>
        <CardAction data-print-hidden>
          <Button
            type="button"
            variant="outline"
            data-testid="btn-print-logs"
            onClick={() => window.print()}
          >
            <Printer data-icon="inline-start" aria-hidden="true" />
            Print / save PDF
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div
          data-testid="log-pager"
          data-print-hidden
          className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              data-testid="btn-prev-log"
              aria-label="Previous log sheet"
              disabled={activeView === 'all' || activeView <= 1}
              onClick={() => activeView !== 'all' && selectDay(activeView - 1)}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              data-testid="btn-next-log"
              aria-label="Next log sheet"
              disabled={activeView === 'all' || activeView >= lastDay}
              onClick={() => activeView !== 'all' && selectDay(activeView + 1)}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
          <Tabs value={String(activeView)} onValueChange={selectView} className="min-w-0 flex-1">
            <TabsList className="max-w-full justify-start overflow-x-auto">
              {trip.daily_logs.map((log) => (
                <TabsTrigger key={log.day_number} value={String(log.day_number)}>
                  Day {log.day_number}
                </TabsTrigger>
              ))}
              <TabsTrigger value="all">All sheets</TabsTrigger>
            </TabsList>
            {trip.daily_logs.map((log) => (
              <TabsContent key={log.day_number} value={String(log.day_number)} forceMount>
                <span className="sr-only">
                  Showing the log sheet for day {log.day_number} below.
                </span>
              </TabsContent>
            ))}
            <TabsContent value="all" forceMount>
              <span className="sr-only">Showing every daily log sheet below.</span>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-col gap-6">
          {trip.daily_logs.map((log) => (
            <LogSheet
              key={log.day_number}
              log={log}
              visible={activeView === 'all' || activeView === log.day_number}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter data-print-hidden>
        Times and compliance values are rendered directly from the saved trip plan.
      </CardFooter>
    </Card>
  );
}
