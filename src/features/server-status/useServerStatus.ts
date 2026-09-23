import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api/client';

async function checkServerHealth() {
  await api.get('/health/');
  return true;
}

export function useServerStatus() {
  const [hasWaited, setHasWaited] = useState(false);
  const health = useQuery({
    queryKey: ['server-health'],
    queryFn: checkServerHealth,
    retry: 1,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!health.isPending && !health.isFetching) return;
    const timeout = window.setTimeout(() => setHasWaited(true), 3_000);
    return () => window.clearTimeout(timeout);
  }, [health.isFetching, health.isPending]);

  return {
    isChecking: health.isPending || health.isFetching,
    showWakeBanner: hasWaited && (health.isPending || health.isFetching),
    isUnavailable: health.isError,
  };
}
