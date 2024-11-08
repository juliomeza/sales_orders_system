import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import OrderCreationFlow from './components/orders/OrderCreationFlow';

// Create a theme instance with purple primary color
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <OrderCreationFlow />
    </ThemeProvider>
  );
}

export default App;