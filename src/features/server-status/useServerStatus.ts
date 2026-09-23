import { useEffect, useState } from 'react';
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

export const serverHealthQuery = queryOptions({
  queryKey: ['server-health'],
  queryFn: async () => {
    await api.get('/health/');
    return true;
  },
  retry: 1,
  staleTime: 30_000,
});

export function useServerStatus() {
  const [hasWaited, setHasWaited] = useState(false);
  const health = useQuery(serverHealthQuery);
  const isChecking = health.isPending || health.isFetching;

  useEffect(() => {
    if (!isChecking) return;
    const timeout = window.setTimeout(() => setHasWaited(true), 3_000);
    return () => window.clearTimeout(timeout);
  }, [isChecking]);

  return {
    showWakeBanner: health.isError || (hasWaited && isChecking),
  };
}
