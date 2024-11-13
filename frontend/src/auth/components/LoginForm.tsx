// frontend/src/auth/components/LoginForm.tsx
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../shared/contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(credentials.email, credentials.password);
      onSuccess?.();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err?.response?.data?.message || 
        err?.message || 
        'Error al intentar iniciar sesión. Por favor intente nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        margin="normal"
        required
        fullWidth
        label="Email Address"
        autoComplete="email"
        autoFocus
        disabled={isLoading}
        value={credentials.email}
        onChange={(e) => setCredentials({
          ...credentials,
          email: e.target.value
        })}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        type="password"
        autoComplete="current-password"
        disabled={isLoading}
        value={credentials.password}
        onChange={(e) => setCredentials({
          ...credentials,
          password: e.target.value
        })}
      />

      <Box sx={{ mt: 3 }}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading}
          sx={{
            height: 48,
            position: 'relative'
          }}
        >
          {isLoading ? (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px'
              }}
            />
          ) : (
            'Sign In'
          )}
        </Button>
      </Box>
    </form>
  );
};

export default LoginForm;