import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LocateFixed, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
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

const suggestedPlaces: LocationOption[] = [
  { label: 'Richmond, VA', lat: 37.5407, lng: -77.436 },
  { label: 'Baltimore, MD', lat: 39.2904, lng: -76.6122 },
  { label: 'Kansas City, MO', lat: 39.0997, lng: -94.5786 },
];

type LocationAutocompleteProps = {
  field: 'current' | 'pickup' | 'dropoff';
  label: string;
  value?: LocationOption;
  onChange: (value: LocationOption | undefined) => void;
  onDraftChange?: (draft: string) => void;
  error?: string;
};

export function LocationAutocomplete({
  field,
  label,
  value,
  onChange,
  onDraftChange,
  error,
}: LocationAutocompleteProps) {
  const [draftValue, setDraftValue] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>();
  const inputValue = value?.label ?? draftValue ?? '';
  const debouncedQuery = useDebouncedValue(inputValue.trim(), 300);
  const inputId = `location-${field}`;
  const isSearchable = debouncedQuery.length >= 3 && inputValue !== value?.label;
  const showSuggestedPlaces = inputValue.trim().length < 3 || inputValue === value?.label;
  const locations = useQuery({
    queryKey: ['locations', debouncedQuery],
    queryFn: () => searchLocations(debouncedQuery),
    enabled: isSearchable,
    staleTime: 60_000,
  });

  function handleInputChange(nextValue: string) {
    setDraftValue(nextValue);
    onDraftChange?.(nextValue);
    setIsOpen(true);
    setLocationError(undefined);
    if (nextValue !== value?.label) onChange(undefined);
  }

  function handleSelect(location: LocationOption) {
    onChange(location);
    setDraftValue(undefined);
    onDraftChange?.('');
    setIsOpen(false);
    setLocationError(undefined);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError('Location is unavailable in this browser. Enter a place instead.');
      return;
    }

    setLocationError(undefined);
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        handleSelect({
          label: `My location (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`,
          lat: coords.latitude,
          lng: coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setLocationError('Location access was not available. Enter a place instead.');
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000 },
    );
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
            onFocus={() => setIsOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setIsOpen(false);
            }}
            placeholder="Search a city or address"
            aria-invalid={Boolean(error)}
            aria-autocomplete="list"
          />
          <CommandList
            hidden={!isOpen || (!showSuggestedPlaces && !isSearchable)}
            data-testid={`suggestions-${field}`}
            className="bg-popover absolute top-full z-20 mt-1 w-full rounded-lg border shadow-md"
          >
            {isOpen && showSuggestedPlaces ? (
              <CommandGroup heading="Suggested places">
                {suggestedPlaces.map((location) => (
                  <CommandItem
                    key={location.label}
                    value={location.label}
                    data-testid="suggestion-item"
                    onSelect={() => handleSelect(location)}
                  >
                    <MapPin aria-hidden="true" />
                    {location.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
            {isOpen && isSearchable && !showSuggestedPlaces ? (
              <>
                {locations.isFetching ? (
                  <div className="text-muted-foreground px-3 py-4 text-center text-sm">
                    Searching locations…
                  </div>
                ) : null}
                {!locations.isFetching ? <CommandEmpty>No locations found.</CommandEmpty> : null}
                <CommandGroup>
                  {locations.data?.map((location) => (
                    <CommandItem
                      key={`${location.lat}-${location.lng}-${location.label}`}
                      value={location.label}
                      data-testid="suggestion-item"
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
      {field === 'current' ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isLocating}
            onClick={useCurrentLocation}
          >
            <LocateFixed data-icon="inline-start" aria-hidden="true" />
            {isLocating ? 'Finding your location…' : 'Use my location'}
          </Button>
          <FieldDescription>Asks for browser permission when you click.</FieldDescription>
        </div>
      ) : null}
      {locationError ? (
        <p role="alert" className="text-destructive text-sm">
          {locationError}
        </p>
      ) : null}
      <FieldError>{error}</FieldError>
    </Field>
  );
}
