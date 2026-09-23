import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type PropsWithChildren } from 'react';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function TestProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(createTestQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
