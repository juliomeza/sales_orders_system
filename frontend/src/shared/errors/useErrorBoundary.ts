// frontend/src/shared/errors/useErrorBoundary.ts
import React, { useState, useCallback, JSXElementConstructor, ReactElement } from 'react';
import { AppError, ErrorSeverity, ErrorCategory } from './AppError';
import { errorHandler } from './ErrorHandler';

interface ErrorBoundaryState {
  error: AppError | null;
  hasError: boolean;
  errorInfo: React.ErrorInfo | null;
}

interface UseErrorBoundaryReturn extends ErrorBoundaryState {
  clearError: () => void;
  handleError: (error: unknown) => void;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((error: AppError) => React.ReactNode);
}

export const useErrorBoundary = (): UseErrorBoundaryReturn => {
  const [state, setState] = useState<ErrorBoundaryState>({
    error: null,
    hasError: false,
    errorInfo: null
  });

  const handleError = useCallback((error: unknown) => {
    const appError = error instanceof AppError ? error : errorHandler.handleError(error);
    
    setState({
      error: appError,
      hasError: true,
      errorInfo: null
    });

    errorHandler.handleError(appError, {
      path: window.location.pathname,
      action: 'ErrorBoundary'
    });
  }, []);

  const clearError = useCallback(() => {
    setState({
      error: null,
      hasError: false,
      errorInfo: null
    });
  }, []);

  return {
    ...state,
    clearError,
    handleError
  };
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    error: null,
    hasError: false,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const appError = error instanceof AppError 
      ? error 
      : new AppError(
          error.message,
          ErrorCategory.TECHNICAL,
          ErrorSeverity.ERROR,
          {
            code: 'ERR_BOUNDARY',
            originalError: error
          }
        );

    return {
      error: appError,
      hasError: true
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    
    errorHandler.handleError(error, {
      path: window.location.pathname,
      action: 'ErrorBoundary'
    });
  }

  public render(): ReactElement<any, string | JSXElementConstructor<any>> {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error) as ReactElement;
        }
        return fallback as ReactElement;
      }

      return React.createElement('div', 
        { role: 'alert', className: 'error-boundary' },
        React.createElement('h2', null, 'Something went wrong'),
        React.createElement('details', null,
          React.createElement('summary', null, error.userMessage),
          React.createElement('pre', null, error.message)
        )
      );
    }

    return children as ReactElement;
  }
}

export const useAsyncError = () => {
  const [, setError] = useState();
  
  return useCallback((error: unknown) => {
    setError(() => {
      throw errorHandler.handleError(error);
    });
  }, []);
};