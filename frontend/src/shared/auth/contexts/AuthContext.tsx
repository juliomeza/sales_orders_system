// frontend/src/shared/auth/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';
import { AuthResponse } from '../../api/types/api.types';

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
          // Verificar el token y obtener datos del usuario
          const userData = await apiClient.get<User>('/auth/me');
          setUser(userData);
        } catch (error) {
          console.error('Error initializing auth:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Login attempt for:', email); // Log inicial
  
      const response = await apiClient.post<AuthResponse>('/auth/login', { 
        email, 
        password 
      });
  
      console.log('Raw API Response:', response); // Log de la respuesta completa
      console.log('Auth Response:', {
        token: response.token ? 'Token present' : 'No token',
        user: response.user
      });
  
      if (!response.token) {
        console.error('No token received in response');
        throw new Error('Invalid response format');
      }
  
      localStorage.setItem('token', response.token);
      setUser(response.user);
      
      console.log('User role:', response.user.role); // Log del rol
  
      // Agregar log antes de la redirección
      console.log('Redirecting user based on role:', response.user.role);
      
      if (response.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Detailed login error:', {
        error,
        response: error.response,
        message: error.message
      });
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  if (isLoading) {
    // Podrías retornar un componente de loading aquí si lo deseas
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;