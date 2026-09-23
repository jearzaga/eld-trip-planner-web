import { ChevronDown } from 'lucide-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import type { TripFormValues } from './schema';

type LogDetailsSectionProps = {
  register: UseFormRegister<TripFormValues>;
  errors: FieldErrors<TripFormValues>['log_meta'];
};

const fields = [
  ['driver_name', 'Driver name'],
  ['co_driver_name', 'Co-driver'],
  ['carrier_name', 'Carrier name'],
  ['main_office_address', 'Main office address'],
  ['home_terminal_address', 'Home terminal address'],
  ['truck_tractor_no', 'Truck / tractor number'],
  ['trailer_no', 'Trailer number'],
  ['shipping_doc_no', 'Shipping document'],
  ['shipper_commodity', 'Shipper and commodity'],
] as const;

export function LogDetailsSection({ register, errors }: LogDetailsSectionProps) {
  return (
    <Collapsible className="group rounded-lg border">
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full justify-between rounded-lg px-3 py-3"
          data-testid="log-details"
        >
          <span className="text-left">
            <span className="block font-medium">Log details</span>
            <span className="text-muted-foreground block text-xs font-normal">
              Optional driver and vehicle fields with demo defaults
            </span>
          </span>
          <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t p-3">
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          {fields.map(([name, label]) => {
            const id = `log-${name}`;
            return (
              <Field key={name} data-invalid={Boolean(errors?.[name])}>
                <FieldLabel htmlFor={id}>{label}</FieldLabel>
                <Input
                  id={id}
                  aria-invalid={Boolean(errors?.[name])}
                  {...register(`log_meta.${name}`)}
                />
                <FieldError>{errors?.[name]?.message}</FieldError>
              </Field>
            );
          })}
        </FieldGroup>
      </CollapsibleContent>
    </Collapsible>
  );
}
