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
import { ErrorBoundary } from './shared/errors/useErrorBoundary';
import { AppError, ErrorSeverity } from './shared/errors/AppError';
import { Alert, Box, Button, Container, Typography, AlertColor } from '@mui/material';

const mapErrorSeverityToAlertColor = (severity: ErrorSeverity): AlertColor => {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return 'error';
    case ErrorSeverity.ERROR:
      return 'error';
    case ErrorSeverity.WARNING:
      return 'warning';
    case ErrorSeverity.INFO:
      return 'info';
    default:
      return 'error';
  }
};

const ErrorFallback = (props: { error: AppError; resetErrorBoundary: () => void }) => (
  <Container maxWidth="md">
    <Box sx={{ 
      mt: 8, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center' 
    }}>
      <Alert 
        severity={mapErrorSeverityToAlertColor(props.error.severity)}
        sx={{ width: '100%', mb: 2 }}
      >
        <Typography variant="h6" gutterBottom>
          {props.error.severity === ErrorSeverity.CRITICAL ? 'Something went wrong' : 'An error occurred'}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {props.error.userMessage}
        </Typography>
        {props.error.severity === ErrorSeverity.CRITICAL && (
          <Typography variant="caption" color="textSecondary">
            Error Code: {props.error.metadata.code}
          </Typography>
        )}
      </Alert>
      <Button 
        variant="contained" 
        onClick={props.resetErrorBoundary}
        sx={{ mt: 2 }}
      >
        Try Again
      </Button>
    </Box>
  </Container>
);

const DataPrefetcher: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeData = async () => {
      if (user) {
        try {
          await prefetchCommonData();
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
    <ErrorBoundary fallback={(error) => <ErrorFallback error={error} resetErrorBoundary={() => window.location.reload()} />}>
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
                    element={
                      <ErrorBoundary 
                        key={route.path}
                        fallback={(error) => (
                          <ErrorFallback 
                            error={error} 
                            resetErrorBoundary={() => window.location.reload()} 
                          />
                        )}
                      >
                        {route.element}
                      </ErrorBoundary>
                    }
                  />
                  ))}
                </Routes>
              </DataPrefetcher>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
        <ReactQueryDevTools />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;