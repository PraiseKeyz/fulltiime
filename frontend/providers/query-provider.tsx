'use client'

import { QueryClient, QueryClientProvider, keepPreviousData } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays "fresh" for 2 min — revisits within that window hit cache
            // with no network call at all.
            staleTime: 2 * 60 * 1000,
            // Keep cached data around for 30 min so navigating back to a page is
            // instant (served from cache, refetched silently in the background).
            gcTime: 30 * 60 * 1000,
            // Show the previous data while a new query loads instead of a skeleton,
            // so switching filters/dates/pages never flashes empty.
            placeholderData: keepPreviousData,
            // Don't refetch everything just because the window regained focus —
            // live data refreshes via its own refetchInterval where needed.
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
