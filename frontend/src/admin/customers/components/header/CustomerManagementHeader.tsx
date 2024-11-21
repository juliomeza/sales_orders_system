// src/admin/customers/components/header/CustomerManagementHeader.tsx
import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface CustomerManagementHeaderProps {
  onCreateNew: () => void;
}

export const CustomerManagementHeader: React.FC<CustomerManagementHeaderProps> = ({
  onCreateNew
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    <Typography variant="h4">Customer Management</Typography>
    <Button
      variant="contained"
      onClick={onCreateNew}
      sx={{ borderRadius: 1 }}
    >
      New Customer
    </Button>
  </Box>
);