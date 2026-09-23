import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, TriangleAlert } from 'lucide-react';
import { Controller, useForm, type FieldPath } from 'react-hook-form';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';

import { CycleInput } from './CycleInput';
import { LocationAutocomplete } from './LocationAutocomplete';
import { LogDetailsSection } from './LogDetailsSection';
import { PlanningLoader } from './PlanningLoader';
import {
  getSampleTripValues,
  getTripFormDefaults,
  tripFormSchema,
  type TripFormValues,
} from './schema';

type TripFormProps = {
  onSubmit: (values: TripFormValues) => Promise<{ id: string }>;
  onPlanned: (id: string) => void;
};

const timeZones = [
  ['America/New_York', 'Eastern Time'],
  ['America/Chicago', 'Central Time'],
  ['America/Denver', 'Mountain Time'],
  ['America/Phoenix', 'Arizona Time'],
  ['America/Los_Angeles', 'Pacific Time'],
  ['America/Anchorage', 'Alaska Time'],
  ['Pacific/Honolulu', 'Hawaii Time'],
] as const;

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error) {
    const status = 'status' in error ? error.status : undefined;
    const code = 'code' in error ? error.code : undefined;
    if (status === null || code === 'NETWORK_ERROR') {
      return 'We could not reach the planning server. Check your connection and try again.';
    }
    if (code === 'PROVIDER_UNAVAILABLE') {
      return 'The routing service is unavailable right now. Please try again.';
    }
    if (status === 502 || status === 503) {
      return 'The planning server is still waking up. Please try again.';
    }
    if ('message' in error) return String(error.message);
  }
  return 'The trip could not be planned. Please try again.';
}

const locationFields = new Set(['current', 'pickup', 'dropoff']);

function apiFieldErrors(error: unknown, formFields: object) {
  const fields =
    typeof error === 'object' && error && 'fields' in error
      ? (error.fields as Record<string, string[]> | undefined)
      : undefined;
  return Object.entries(fields ?? {}).flatMap(([apiField, messages]) => {
    const [root = ''] = apiField.split('.');
    if (!(root in formFields)) return [];
    const formField = locationFields.has(root) ? root : apiField;
    return [[formField as FieldPath<TripFormValues>, messages.join(' ')] as const];
  });
}

export function TripForm({ onSubmit, onPlanned }: TripFormProps) {
  const defaults = useMemo(() => getTripFormDefaults(), []);
  const availableTimeZones = useMemo<ReadonlyArray<readonly [string, string]>>(
    () =>
      timeZones.some(([value]) => value === defaults.home_timezone)
        ? timeZones
        : [[defaults.home_timezone, defaults.home_timezone], ...timeZones],
    [defaults.home_timezone],
  );
  const [submitError, setSubmitError] = useState<string>();
  const {
    control,
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: defaults,
  });

  const submit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      const result = await onSubmit(values);
      onPlanned(result.id);
    } catch (error) {
      for (const [field, message] of apiFieldErrors(error, defaults)) {
        setError(field, { type: 'server', message });
      }
      setSubmitError(getErrorMessage(error));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip details</CardTitle>
        <CardDescription>
          Add the route and current cycle usage. The server will calculate stops and logs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form data-testid="trip-form" className="flex flex-col gap-5" onSubmit={submit} noValidate>
          <FieldGroup>
            <Controller
              name="current"
              control={control}
              render={({ field }) => (
                <LocationAutocomplete
                  field="current"
                  label="Current location"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.current?.message}
                />
              )}
            />
            <Controller
              name="pickup"
              control={control}
              render={({ field }) => (
                <LocationAutocomplete
                  field="pickup"
                  label="Pickup location"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.pickup?.message}
                />
              )}
            />
            <Controller
              name="dropoff"
              control={control}
              render={({ field }) => (
                <LocationAutocomplete
                  field="dropoff"
                  label="Drop-off location"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.dropoff?.message}
                />
              )}
            />
            <Controller
              name="cycle_used_hrs"
              control={control}
              render={({ field }) => (
                <CycleInput
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.cycle_used_hrs?.message}
                />
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.start_time)}>
                <FieldLabel htmlFor="trip-start">Trip start</FieldLabel>
                <Input
                  id="trip-start"
                  data-testid="input-start-time"
                  type="datetime-local"
                  step={900}
                  aria-invalid={Boolean(errors.start_time)}
                  {...register('start_time')}
                />
                <FieldError>{errors.start_time?.message}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.home_timezone)}>
                <FieldLabel htmlFor="home-timezone">Home-terminal time zone</FieldLabel>
                <NativeSelect
                  id="home-timezone"
                  className="w-full"
                  aria-invalid={Boolean(errors.home_timezone)}
                  {...register('home_timezone')}
                >
                  {availableTimeZones.map(([value, label]) => (
                    <NativeSelectOption key={value} value={value}>
                      {label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <FieldError>{errors.home_timezone?.message}</FieldError>
              </Field>
            </div>

            <Controller
              name="include_inspections"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal" className="rounded-lg border p-3">
                  <div className="flex-1">
                    <FieldLabel htmlFor="include-inspections">Include inspections</FieldLabel>
                    <p className="text-muted-foreground text-sm">
                      Add pre-trip and post-trip inspection time to the plan.
                    </p>
                  </div>
                  <Switch
                    id="include-inspections"
                    data-testid="toggle-inspections"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />

            <LogDetailsSection register={register} errors={errors.log_meta} />
          </FieldGroup>

          {isSubmitting ? <PlanningLoader /> : null}
          {submitError ? (
            <Alert variant="destructive" data-testid="error-banner">
              <TriangleAlert aria-hidden="true" />
              <AlertTitle>Planning failed</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
              <AlertAction>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  data-testid="error-retry"
                  onClick={() => void submit()}
                >
                  Try again
                </Button>
              </AlertAction>
            </Alert>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              data-testid="btn-sample-trip"
              disabled={isSubmitting}
              onClick={() => reset(getSampleTripValues(defaults))}
            >
              <Sparkles data-icon="inline-start" aria-hidden="true" />
              Try a sample trip
            </Button>
            <Button type="submit" data-testid="btn-plan-trip" disabled={isSubmitting}>
              Plan trip
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
