// frontend/src/App.routes.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginPage from './shared/auth/pages/LoginPage';
import AdminApp from './admin/app/AdminApp';
import ClientApp from './client/app/ClientApp';
import ProtectedRoute from './shared/components/auth/ProtectedRoute';

export interface AppRoute {
  path: string;
  element: React.ReactNode;
}

export const appRoutes: AppRoute[] = [
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/admin/*',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminApp />
      </ProtectedRoute>
    )
  },
  {
    path: '/*',
    element: (
      <ProtectedRoute allowedRoles={['CLIENT']}>
        <ClientApp />
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
];