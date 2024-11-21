// frontend/src/admin/customers/CustomerManagement.tsx
import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import CustomersTable from './CustomersTable';
import CustomerDialog from './CustomerDialog';
import CustomerDeleteDialog from './CustomerDeleteDialog';
import { useCustomers } from './hooks/useCustomers';
import { useCustomerTable } from './hooks/useCustomerTable';

const CustomerManagement: React.FC = () => {
  const { 
    customers, 
    loadCustomers, 
    handleCreateCustomer, 
    handleUpdateCustomer, 
    handleDeleteCustomer 
  } = useCustomers();

  const {
    searchTerm,
    selectedCustomer,
    isDeleteDialogOpen,
    isEditDialogOpen,
    handleSearchChange,
    handleOpenCreateDialog,
    handleEdit,
    handleDelete,
    handleCloseDialogs
  } = useCustomerTable();

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSubmit = async (data: any) => {
    if (selectedCustomer) {
      await handleUpdateCustomer(selectedCustomer.id, data);
    } else {
      await handleCreateCustomer(data);
    }
    handleCloseDialogs();
    loadCustomers();
  };

  const handleConfirmDelete = async () => {
    if (selectedCustomer) {
      await handleDeleteCustomer(selectedCustomer.id);
      handleCloseDialogs();
      loadCustomers();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Customer Management</Typography>
        <Button
          variant="contained"
          onClick={handleOpenCreateDialog}
          sx={{ borderRadius: 1 }}
        >
          New Customer
        </Button>
      </Box>

      <Card>
        <CardContent>
          <CustomersTable
            customers={customers}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <CustomerDialog
        open={isEditDialogOpen}
        customer={selectedCustomer}
        onClose={handleCloseDialogs}
        onSubmit={handleSubmit}
      />

      <CustomerDeleteDialog 
        open={isDeleteDialogOpen}
        customerName={selectedCustomer?.name || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDialogs}
      />
    </Box>
  );
};

export default CustomerManagement;