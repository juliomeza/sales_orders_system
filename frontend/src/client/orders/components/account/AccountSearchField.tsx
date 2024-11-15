// frontend/src/client/orders/components/account/AccountSearchField.tsx
import React from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography
} from '@mui/material';
import { ShippingAddress } from '../../../../shared/types/shipping';

interface AccountSearchFieldProps {
  accounts: ShippingAddress[];
  value: ShippingAddress | null;
  onChange: (value: string, address?: ShippingAddress) => void;
  disabled?: boolean;
  type: 'shipping' | 'billing';
  label?: string;
}

const AccountSearchField: React.FC<AccountSearchFieldProps> = ({
  accounts,
  value,
  onChange,
  disabled,
  type,
  label
}) => {
  const accountTypeLabel = type === 'shipping' ? 'Shipping' : 'Billing';
  const displayLabel = label || `Account (${accountTypeLabel})`;

  const labelStyles = {
    '& .MuiInputLabel-shrink': {
      transform: 'translate(14px, -3px) scale(0.75)',
      background: '#fff',
      padding: '0 8px'
    }
  };

  return (
    <Autocomplete
      value={value}
      onChange={(_, newValue) => {
        if (newValue) {
          onChange(newValue.id, newValue);
        } else {
          onChange('');
        }
      }}
      options={accounts}
      getOptionLabel={(option) => option.name}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body1">
              {option.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.address}, {option.city}, {option.state} {option.zipCode}
            </Typography>
          </Box>
        </Box>
      )}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={displayLabel}
          variant="outlined"
          placeholder={`Search or select ${accountTypeLabel.toLowerCase()} account`}
          fullWidth
          sx={labelStyles}
        />
      )}
      ListboxProps={{
        sx: { maxHeight: '256px' }
      }}
    />
  );
};

export default AccountSearchField;