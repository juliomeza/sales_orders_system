// src/admin/customers/components/form-fields/StatusToggle.tsx
import React from 'react';
import { FormControlLabel, Switch, Box } from '@mui/material';

interface StatusToggleProps {
  value: number;
  onChange: (name: string, value: number) => void;
}

export const StatusToggle: React.FC<StatusToggleProps> = ({
  value,
  onChange
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange('status', event.target.checked ? 1 : 2);
  };

  return (
    <FormControlLabel
      control={
        <Switch
          checked={value === 1}
          onChange={handleChange}
          color="primary"
        />
      }
      label={
        <Box 
          component="span" 
          sx={{ 
            color: value === 1 ? 'success.main' : 'text.secondary' 
          }}
        >
          {value === 1 ? 'Active' : 'Inactive'}
        </Box>
      }
    />
  );
};