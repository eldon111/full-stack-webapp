import '@/pages/App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router';
import NavMenu from '@/pages/shared/NavMenu.tsx';
import Upload from '@/pages/Upload.tsx';
import Login from '@/pages/Login.tsx';
import Home from '@/pages/Home.tsx';
import { TRPCProvider } from '@/utils/trpc.ts';
import { useState } from 'react';
import { createTRPCClient, createWSClient, httpLink, splitLink, TRPCClientErrorLike, wsLink } from '@trpc/client';
import type { AppRouter } from 'backend/routes/router';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, _err) => {
          const err = _err as never as TRPCClientErrorLike<AppRouter>;
          const MAX_QUERY_RETRIES = 3;

          // Prevent retries if the error is a 4xx
          const status = err?.data?.httpStatus ?? 0;
          if (status >= 400 && status < 500) {
            return false;
          }
          return failureCount < MAX_QUERY_RETRIES;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

let wsClient: ReturnType<typeof createWSClient> | undefined = undefined;

function getWSClient() {
  if (!wsClient) {
    wsClient = createWSClient({
      url: `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/api`,
      onError(err) {
        console.error(err);
      },
    });
  }
  return wsClient;
}

function App() {
  const queryClient = getQueryClient();
  const wsClient = getWSClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        splitLink({
          condition(op) {
            return op.type === 'subscription';
          },
          true: wsLink({ client: wsClient }),
          false: httpLink({
            url: `${import.meta.env.VITE_REACT_APP_API_BASE_URL}/api`,
            fetch(url, options) {
              return fetch(url, {
                ...options,
                credentials: 'include',
              });
            },
          }),
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <BrowserRouter>
          <NavMenu />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </TRPCProvider>
    </QueryClientProvider>
  );
}

export default App;
