// frontend/src/admin/app/AdminApp.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navigation from '../../shared/components/navigation/Navigation';
import CustomerManagement from '../customers/CustomerManagement';

// Placeholder components for admin routes
const Dashboard = () => (
  <Box>
    <h2>Admin Dashboard</h2>
    <p>Welcome to the admin dashboard</p>
  </Box>
);

const Users = () => (
  <Box>
    <h2>User Management</h2>
    <p>User management interface will be implemented here</p>
  </Box>
);

const Materials = () => (
  <Box>
    <h2>Material Management</h2>
    <p>Material management interface will be implemented here</p>
  </Box>
);

const AdminApp: React.FC = () => {
  return (
    <Box sx={(theme) => ({ 
      minHeight: '100vh', 
      bgcolor: theme.palette.background.default,
      pt: '64px' // Add padding top to account for fixed Navigation
    })}>
      <Navigation isAdmin />
      
      <Container maxWidth={false} sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Container>
    </Box>
  );
};

export default AdminApp;