// frontend/src/shared/auth/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import { AuthResponse } from '../../api/types/api.types';
import { errorHandler } from '../../errors/ErrorHandler';
import { AppError, ErrorCategory, ErrorSeverity } from '../../errors/AppError';
import { API_ERROR_CODES } from '../../errors/ErrorCodes';

type Role = 'ADMIN' | 'CLIENT';

interface User {
  id: number;
  email: string;
  role: Role;
  customerId?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await apiClient.get<User>('/auth/me');
          setUser(userData);
        } catch (error) {
          const appError = new AppError(
            'Session expired or invalid',
            ErrorCategory.AUTHENTICATION,
            ErrorSeverity.WARNING,
            {
              code: API_ERROR_CODES.SESSION_EXPIRED,
              originalError: error
            }
          );
          errorHandler.handleError(appError);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', { 
        email, 
        password 
      });

      if (!response.token) {
        throw new AppError(
          'Invalid authentication response',
          ErrorCategory.AUTHENTICATION,
          ErrorSeverity.ERROR,
          { code: API_ERROR_CODES.INVALID_CREDENTIALS }
        );
      }

      localStorage.setItem('token', response.token);
      setUser(response.user);
      
      navigate(response.user.role === 'ADMIN' ? '/admin' : '/');
    } catch (error) {
      const appError = error instanceof AppError ? error :
        new AppError(
          'Authentication failed',
          ErrorCategory.AUTHENTICATION,
          ErrorSeverity.ERROR,
          {
            code: API_ERROR_CODES.INVALID_CREDENTIALS,
            originalError: error
          }
        );
        errorHandler.handleError(appError);
      throw appError;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
    } catch (error) {
      errorHandler.handleError(error, {
        action: 'Logout',
        path: '/login'
      });
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new AppError(
      'useAuth must be used within an AuthProvider',
      ErrorCategory.TECHNICAL,
      ErrorSeverity.ERROR,
      { code: API_ERROR_CODES.CONTEXT_ERROR }
    );
  }
  return context;
};

export default AuthContext;