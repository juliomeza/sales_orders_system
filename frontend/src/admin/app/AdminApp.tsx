// frontend/src/admin/app/AdminApp.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';
import Navigation from '../../shared/components/navigation/Navigation';

// Placeholder components for admin routes
const Dashboard = () => (
  <Box>
    <Typography variant="h4" sx={{ mb: 3 }}>Admin Dashboard</Typography>
    <Typography>Welcome to the admin dashboard</Typography>
  </Box>
);

const Users = () => (
  <Box>
    <Typography variant="h4" sx={{ mb: 3 }}>User Management</Typography>
    <Typography>User management interface will be implemented here</Typography>
  </Box>
);

const Customers = () => (
  <Box>
    <Typography variant="h4" sx={{ mb: 3 }}>Customer Management</Typography>
    <Typography>Customer management interface will be implemented here</Typography>
  </Box>
);

const Materials = () => (
  <Box>
    <Typography variant="h4" sx={{ mb: 3 }}>Material Management</Typography>
    <Typography>Material management interface will be implemented here</Typography>
  </Box>
);

const AdminApp: React.FC = () => {
  return (
    <Box sx={(theme) => ({ 
      minHeight: '100vh', 
      bgcolor: theme.palette.background.default 
    })}>
      <Navigation isAdmin />
      
      <Container maxWidth={false} sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Container>
    </Box>
  );
};

export default AdminApp;