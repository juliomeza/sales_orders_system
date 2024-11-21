// frontend/src/admin/customers/CustomerManagement.tsx
import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import CustomersTable from './CustomersTable';
import CustomerDialog from './CustomerDialog';
import { useCustomers } from './useCustomers';

export interface Customer {
  id: number;
  lookupCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  status: number;
  projects: Array<{
    id: number;
    name: string;
    isDefault: boolean;
  }>;
  _count: {
    users: number;
  };
}

const CustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const {
    customers,
    isLoading,
    error,
    handleCreateCustomer,
    handleUpdateCustomer,
  } = useCustomers(searchTerm);

  const handleOpenDialog = (customer: Customer | null = null) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (selectedCustomer) {
      await handleUpdateCustomer(data);
    } else {
      await handleCreateCustomer(data);
    }
    setIsDialogOpen(false);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Customer Management
          </Typography>
          
          <TextField
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Box>

        <CustomersTable
          customers={customers}
          isLoading={isLoading}
          error={error}
          onEdit={handleOpenDialog}
          onView={(customer) => console.log('View customer', customer)}
        />
      </Paper>

      <CustomerDialog
        open={isDialogOpen}
        customer={selectedCustomer}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default CustomerManagement;