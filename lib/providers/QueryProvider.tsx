// lib/providers/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
    children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
    // Créer le QueryClient une seule fois
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Garder les données fraîches pendant 5 minutes
                staleTime: 5 * 60 * 1000,
                // Cache pendant 10 minutes
                gcTime: 10 * 60 * 1000,
                // Retry automatique en cas d'erreur
                retry: 2,
                retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
                // Refetch en arrière-plan quand la fenêtre refait focus
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools seulement en développement */}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}