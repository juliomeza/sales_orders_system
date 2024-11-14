// frontend/src/client/components/orders/inventory/Inventory_SearchBar.tsx
import React from 'react';
import { Box, TextField } from '@mui/material';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const Inventory_SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        fullWidth
        label="Search Inventory"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1,
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
          }
        }}
      />
    </Box>
  );
};

export default Inventory_SearchBar;