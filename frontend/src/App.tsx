// frontend/src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './shared/auth/contexts/AuthContext';
import { theme } from './App.theme';
import { appRoutes } from './App.routes';
import { queryClient, prefetchCommonData } from './shared/config/queryClient';
import { ReactQueryDevTools } from './shared/components/devtools/ReactQueryDevTools';
import { useAuth } from './shared/auth/contexts/AuthContext';

// Separate component to handle data prefetching
const DataPrefetcher: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      prefetchCommonData().catch(console.error);
    }
  }, [user]);

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