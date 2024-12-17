// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './shared/auth/contexts/AuthContext';
import { theme } from './App.theme';
import { appRoutes } from './App.routes';
import { queryClient } from './shared/config/queryClient';
import { ReactQueryDevTools } from './shared/components/devtools/ReactQueryDevTools';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {appRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
      <ReactQueryDevTools />
    </QueryClientProvider>
  );
}

export default App;