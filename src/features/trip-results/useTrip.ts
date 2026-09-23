import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

import { tripPlanSchema } from './schema';

async function getTrip(id: string) {
  const response = await api.get(`/trips/${id}/`);
  return tripPlanSchema.parse(response.data);
}

export function useTrip(id?: string) {
  return useQuery({
    queryKey: ['trip', id],
    queryFn: () => getTrip(id!),
    enabled: Boolean(id),
  });
}
