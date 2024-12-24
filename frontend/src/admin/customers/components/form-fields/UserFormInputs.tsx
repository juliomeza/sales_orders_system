// frontend/src/admin/customers/components/form-fields/UserFormInputs.tsx
import React, { useState } from 'react';
import { TextField, Box, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface UserFormInputsProps {
  email: string;
  password: string;
  confirmPassword: string;
  onChange: (field: 'email' | 'password' | 'confirmPassword', value: string) => void;
  error?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
}

export const UserFormInputs: React.FC<UserFormInputsProps> = ({
  email,
  password,
  confirmPassword,
  onChange,
  error
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => onChange('email', e.target.value)}
        error={!!error?.email}
        helperText={error?.email}
        size="small"
        fullWidth
      />
      
      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => onChange('password', e.target.value)}
        error={!!error?.password}
        helperText={error?.password}
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <TextField
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={(e) => onChange('confirmPassword', e.target.value)}
        error={!!error?.confirmPassword}
        helperText={error?.confirmPassword}
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClickShowConfirmPassword}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </Box>
  );
};