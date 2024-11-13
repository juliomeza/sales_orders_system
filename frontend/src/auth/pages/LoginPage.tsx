// frontend/src/auth/pages/LoginPage.tsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container
} from '@mui/material';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 'sm' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography
                component="h1"
                variant="h4"
                color="primary"
                gutterBottom
                fontWeight="bold"
              >
                Sales Order System
              </Typography>
              
              <Typography variant="h6" color="text.secondary">
                Sign In to Your Account
              </Typography>
            </Box>

            <LoginForm />
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                This is a secure system and unauthorized access is prohibited.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;