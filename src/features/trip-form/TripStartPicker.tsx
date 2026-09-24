import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type TripStartPickerProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : undefined;
}

export function TripStartPicker({ value, onChange, error }: TripStartPickerProps) {
  const [open, setOpen] = useState(false);
  const [date = '', time = ''] = value.split('T');
  const selected = parseDate(date);

  function selectDate(nextDate: Date | undefined) {
    if (!nextDate) return;
    onChange(`${format(nextDate, 'yyyy-MM-dd')}T${time}`);
    setOpen(false);
  }

  return (
    <FieldGroup className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor="trip-start">Trip start date</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="trip-start"
              type="button"
              variant="outline"
              data-testid="input-start-time"
              aria-label="Open trip start calendar"
              aria-invalid={Boolean(error)}
              className="w-full justify-between font-normal"
            >
              {selected ? format(selected, 'MMM d, yyyy') : 'Choose a date'}
              <CalendarDays data-icon="inline-end" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" collisionPadding={8} className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selected}
              defaultMonth={selected}
              captionLayout="dropdown"
              startMonth={new Date(2000, 0)}
              endMonth={new Date(2100, 11)}
              onSelect={selectDate}
              className="[--cell-size:2.5rem]"
            />
            <div className="border-t p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => selectDate(new Date())}
              >
                Today
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <FieldError>{error}</FieldError>
      </Field>
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor="trip-start-clock">Start time</FieldLabel>
        <Input
          id="trip-start-clock"
          data-testid="input-start-clock"
          type="time"
          step={900}
          value={time}
          onChange={(event) => onChange(`${date}T${event.target.value}`)}
          aria-invalid={Boolean(error)}
        />
      </Field>
    </FieldGroup>
  );
}
