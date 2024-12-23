// frontend/src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './shared/auth/contexts/AuthContext';
import { theme } from './App.theme';
import { appRoutes } from './App.routes';
import { queryClient, prefetchCommonData } from './shared/config/queryClient';
import { ReactQueryDevTools } from './shared/components/devtools/ReactQueryDevTools';
import { queryKeys } from './shared/config/queryKeys';

// Separate component to handle data prefetching
const DataPrefetcher: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeData = async () => {
      if (user) {
        try {
          // Prefetch common data
          await prefetchCommonData();
          
          // Force revalidation of critical data
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.shipping.carriers }),
            queryClient.invalidateQueries({ queryKey: queryKeys.shipping.warehouses })
          ]);
        } catch (error) {
          console.error('Error initializing data:', error);
        }
      }
    };

    initializeData();
  }, [user, queryClient]);

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <DataPrefetcher>
              <Routes>
                {appRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  />
                ))}
              </Routes>
            </DataPrefetcher>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
      <ReactQueryDevTools />
    </QueryClientProvider>
  );
}

export default App;