// frontend/src/client/app/ClientApp.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navigation from '../../shared/components/navigation/Navigation';
import OrderCreationFlow from '../orders/components/creation/flow/OrderCreationFlow';

// Placeholder for Orders List page
const OrdersList = () => (
  <Box sx={{ 
    px: 4, 
    py: 3, 
    bgcolor: 'grey.50',
    minHeight: 'calc(100vh - 240px)',
    marginTop: '60px'
  }}>
    <h1>Orders List</h1>
    <p>Orders list will be implemented here</p>
  </Box>
);

const ClientApp = () => {
  return (
    <Box sx={(theme) => ({ 
      minHeight: '100vh', 
      bgcolor: theme.palette.background.default 
    })}>
      <Navigation />
      <Container maxWidth={false} sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<OrdersList />} />
          <Route path="/new-order" element={<OrderCreationFlow />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Box>
  );
};

export default ClientApp;