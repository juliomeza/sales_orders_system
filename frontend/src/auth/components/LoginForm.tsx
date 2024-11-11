// src/auth/components/LoginForm.tsx
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Alert,
  Box
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
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
    } catch (err) {
      setError('Invalid credentials. Please try again.');
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
        value={credentials.password}
        onChange={(e) => setCredentials({
          ...credentials,
          password: e.target.value
        })}
      />

      <Box sx={{ mt: 3 }}>
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          loading={isLoading}
        >
          Sign In
        </LoadingButton>
      </Box>
    </form>
  );
};

export default LoginForm;