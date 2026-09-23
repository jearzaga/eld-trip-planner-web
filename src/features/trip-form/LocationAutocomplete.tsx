import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';

import { searchLocations } from './api';
import type { LocationOption } from './schema';
import { useDebouncedValue } from './useDebouncedValue';

export type { LocationOption } from './schema';

type LocationAutocompleteProps = {
  field: 'current' | 'pickup' | 'dropoff';
  label: string;
  value?: LocationOption;
  onChange: (value: LocationOption | undefined) => void;
  error?: string;
};

export function LocationAutocomplete({
  field,
  label,
  value,
  onChange,
  error,
}: LocationAutocompleteProps) {
  const [draftValue, setDraftValue] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputValue = value?.label ?? draftValue ?? '';
  const debouncedQuery = useDebouncedValue(inputValue.trim(), 300);
  const inputId = `location-${field}`;
  const isSearchable = debouncedQuery.length >= 3 && inputValue !== value?.label;
  const locations = useQuery({
    queryKey: ['locations', debouncedQuery],
    queryFn: () => searchLocations(debouncedQuery),
    enabled: isSearchable,
    staleTime: 60_000,
  });

  function handleInputChange(nextValue: string) {
    setDraftValue(nextValue);
    setIsOpen(nextValue.trim().length >= 3);
    setActiveIndex(-1);
    if (nextValue !== value?.label) onChange(undefined);
  }

  function handleSelect(location: LocationOption) {
    onChange(location);
    setDraftValue(undefined);
    setIsOpen(false);
  }

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <div className="relative">
        <Command shouldFilter={false} className="border p-0">
          <CommandInput
            id={inputId}
            aria-label={label}
            data-testid={`input-${field}`}
            value={inputValue}
            onValueChange={handleInputChange}
            onFocus={() => setIsOpen(inputValue.trim().length >= 3)}
            onKeyDown={(event) => {
              const results = locations.data ?? [];
              if (event.key === 'ArrowDown' && results.length > 0) {
                event.preventDefault();
                setActiveIndex((current) => Math.min(current + 1, results.length - 1));
              }
              if (event.key === 'ArrowUp' && results.length > 0) {
                event.preventDefault();
                setActiveIndex((current) => Math.max(current - 1, 0));
              }
              if (event.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
                event.preventDefault();
                handleSelect(results[activeIndex]);
              }
              if (event.key === 'Escape') setIsOpen(false);
            }}
            placeholder="City, state, or address"
            aria-invalid={Boolean(error)}
            aria-autocomplete="list"
          />
          <CommandList
            hidden={!isOpen || !isSearchable}
            data-testid={`suggestions-${field}`}
            className="bg-popover absolute top-full z-20 mt-1 w-full rounded-lg border shadow-md"
          >
            {isOpen && isSearchable ? (
              <>
                {locations.isFetching ? (
                  <div className="text-muted-foreground px-3 py-4 text-center text-sm">
                    Searching locations…
                  </div>
                ) : null}
                {!locations.isFetching ? <CommandEmpty>No locations found.</CommandEmpty> : null}
                <CommandGroup>
                  {locations.data?.map((location, index) => (
                    <CommandItem
                      key={`${location.lat}-${location.lng}-${location.label}`}
                      value={location.label}
                      data-testid="suggestion-item"
                      className={activeIndex === index ? 'bg-muted' : undefined}
                      onSelect={() => handleSelect(location)}
                    >
                      {location.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </div>
      <FieldDescription>Select a result so the route has exact coordinates.</FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
  );
}
