import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

type CycleInputProps = {
  value: number;
  onChange: (value: number) => void;
  error?: string;
};

function formatHours(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0$/, '');
}

export function CycleInput({ value, onChange, error }: CycleInputProps) {
  const availableHours = Math.max(0, 70 - value);

  return (
    <Field data-invalid={Boolean(error)}>
      <div className="flex items-end justify-between gap-4">
        <FieldLabel htmlFor="cycle-used">Current cycle used</FieldLabel>
        <span className="text-muted-foreground text-sm font-medium">
          {formatHours(availableHours)} h available
        </span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-4">
        <Slider
          aria-label="Cycle hour slider"
          min={0}
          max={70}
          step={0.25}
          value={[Math.min(70, Math.max(0, value))]}
          onValueChange={([nextValue]) => onChange(nextValue ?? 0)}
        />
        <Input
          id="cycle-used"
          data-testid="input-cycle-used"
          type="number"
          min={0}
          max={70}
          step={0.25}
          inputMode="decimal"
          value={value}
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            onChange(event.target.value === '' ? 0 : event.target.valueAsNumber);
          }}
        />
      </div>
      <FieldDescription>Enter hours already used in the current 70-hour cycle.</FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
  );
}
