// src/admin/customers/components/form-fields/UserFormInputs.tsx
import React from 'react';
import { TextField, Box } from '@mui/material';

interface UserFormInputsProps {
  email: string;
  onChange: (value: string) => void;
  error: boolean;
  helperText?: string;
}

export const UserFormInputs: React.FC<UserFormInputsProps> = ({
  email,
  onChange,
  error,
  helperText
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        helperText={helperText}
        size="small"
        fullWidth
      />
    </Box>
  );
};