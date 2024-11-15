// frontend/src/client/orders/components/inventory/SearchBar.tsx
import React, { useRef, useEffect } from 'react';
import { Box, TextField, InputAdornment, CircularProgress } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isLoading?: boolean;
}

const InventorySearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  isLoading = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Mantener el foco cuando cambia el estado de carga
  useEffect(() => {
    if (inputRef.current) {
      const input = inputRef.current;
      const cursorPosition = input.selectionStart;
      
      // Restaurar el foco y la posición del cursor
      input.focus();
      // Asegurarnos de que el cursor se mantiene en la misma posición
      requestAnimationFrame(() => {
        input.setSelectionRange(cursorPosition, cursorPosition);
      });
    }
  }, [isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
    
    // Guardar la posición actual del cursor
    const cursorPosition = e.target.selectionStart;
    
    // Restaurar el foco y la posición del cursor después del cambio
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <TextField
        inputRef={inputRef}
        fullWidth
        label="Search Inventory"
        variant="outlined"
        value={searchTerm}
        onChange={handleChange}
        placeholder="Search by code or description..."
        autoComplete="off"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: isLoading ? (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ) : null,
          sx: {
            '&.Mui-focused': {
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
                borderWidth: '2px',
              },
            },
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1,
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />
    </Box>
  );
};

export default InventorySearchBar;