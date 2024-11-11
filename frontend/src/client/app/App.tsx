import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AdminApp from '../../admin/app/AdminApp';
import OrderCreationFlow from '../components/orders/OrderCreationFlow';
import Navigation from '../../shared/components/common/Navigation';
import { Box, Container } from '@mui/material';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#4a148c', // deep purple
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/*" element={<ClientApp />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;