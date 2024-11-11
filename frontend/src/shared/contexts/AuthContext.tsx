// src/shared/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Define el tipo Role como unión literal
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
    // Check for existing session
    const token = localStorage.getItem('token');
    if (token) {
      // Aquí agregaremos la llamada API para verificar el token
      // Por ahora solo actualizamos el estado de carga
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Aquí irá la llamada al API cuando la implementemos
      // Por ahora, simulamos la respuesta
      const determinedRole: Role = email.includes('admin') ? 'ADMIN' : 'CLIENT';
      
      const mockUser: User = {
        id: 1,
        email,
        role: determinedRole,
        customerId: 1,
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store token
      localStorage.setItem('token', 'mock-token');
      
      // Update state
      setUser(mockUser);

      // Redirect based on role
      if (mockUser.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

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