// frontend/src/admin/customers/components/CustomerSearchBar.tsx
import React from 'react';
import {
  TextField,
  InputAdornment,
  Box
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface CustomerSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const CustomerSearchBar: React.FC<CustomerSearchBarProps> = ({
  value,
  onChange
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search customers..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1
          }
        }}
      />
    </Box>
  );
};

export default CustomerSearchBar;