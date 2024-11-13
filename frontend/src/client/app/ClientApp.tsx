// frontend/src/client/app/ClientApp.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navigation from '../../shared/components/common/Navigation';
import OrderCreationFlow from '../components/orders/OrderCreationFlow';

// Placeholder for Orders List page
const OrdersList = () => (
  <Box>
    <h1>Orders List</h1>
    <p>Orders list will be implemented here</p>
  </Box>
);

const ClientApp = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
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