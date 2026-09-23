import { z } from 'zod';

import { api } from '@/lib/api/client';

import { locationSchema, type LocationOption, type TripFormValues } from './schema';

const locationResultsSchema = z.array(locationSchema);
const plannedTripSchema = z.object({ id: z.string().min(1) }).passthrough();

export async function searchLocations(query: string): Promise<LocationOption[]> {
  const response = await api.get('/geocode/', { params: { q: query } });
  return locationResultsSchema.parse(response.data);
}

export async function planTrip(input: TripFormValues): Promise<{ id: string }> {
  const response = await api.post('/trips/', input);
  return plannedTripSchema.parse(response.data);
}
