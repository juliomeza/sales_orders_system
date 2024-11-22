// src/admin/customers/CustomerManagement.tsx
import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CircularProgress } from '@mui/material';
import CustomersTable from './components/tables/CustomersTable';
import { CustomerDialog } from './components/dialog/CustomerDialog';
import { CustomerDeleteDialog } from './components/dialog/CustomerDialogDelete';
import { CustomerManagementHeader } from './components/header/CustomerManagementHeader';
import SuccessNotification from './components/notifications/SuccessNotification';
import { useCustomers } from './hooks/useCustomers';
import { useCustomerTable } from './hooks/useCustomerTable';
import { CreateCustomerData } from './types';

const CustomerManagement: React.FC = () => {
  const { 
    customers, 
    isLoading,
    error,
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

  const [notification, setNotification] = useState({
    open: false,
    message: ''
  });

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSubmit = async (data: CreateCustomerData) => {
    try {
      if (selectedCustomer) {
        await handleUpdateCustomer(selectedCustomer.id, data);
        setNotification({
          open: true,
          message: 'Customer updated successfully'
        });
      } else {
        await handleCreateCustomer(data);
        setNotification({
          open: true,
          message: 'Customer created successfully'
        });
      }
      handleCloseDialogs();
      loadCustomers();
    } catch (error) {
      console.error('Error:', error);
      setNotification({
        open: true,
        message: 'An error occurred while saving the customer'
      });
    }
  };

  const handleUpdatePartial = async (customerId: number, data: Partial<CreateCustomerData>) => {
    try {
      // Si tenemos el cliente seleccionado, usamos sus datos actuales como base
      const currentCustomer = customers.find(c => c.id === customerId);
      if (!currentCustomer) throw new Error('Customer not found');

      const completeData: CreateCustomerData = {
        customer: currentCustomer,
        projects: currentCustomer.projects || [],
        users: currentCustomer.users || [],
        ...data // Sobrescribimos con los datos actualizados
      };

      await handleUpdateCustomer(customerId, completeData);
      
      setNotification({
        open: true,
        message: 'Changes saved successfully'
      });
      
      await loadCustomers();
    } catch (error) {
      console.error('Error:', error);
      setNotification({
        open: true,
        message: 'An error occurred while saving changes'
      });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedCustomer) {
        await handleDeleteCustomer(selectedCustomer.id);
        setNotification({
          open: true,
          message: 'Customer deleted successfully'
        });
        handleCloseDialogs();
        loadCustomers();
      }
    } catch (error) {
      console.error('Error:', error);
      setNotification({
        open: true,
        message: 'An error occurred while deleting the customer'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Box color="error.main">
              Error loading customers: {error}
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <CustomerManagementHeader onCreateNew={handleOpenCreateDialog} />

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
        onUpdate={handleUpdatePartial}
      />

      <CustomerDeleteDialog 
        open={isDeleteDialogOpen}
        customerName={selectedCustomer?.name || ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDialogs}
      />

      <SuccessNotification
        open={notification.open}
        message={notification.message}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default CustomerManagement;