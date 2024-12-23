/**
 * CustomerManagement Component
 * 
 * Main component for managing customers. Provides functionality for:
 * - Viewing customer list
 * - Creating new customers
 * - Editing existing customers
 * - Deleting customers
 * - Searching customers
 */
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
  // Custom hooks for managing customer data and table interactions
  const { 
    customers, 
    isLoading,
    error,
    loadCustomers, 
    handleCreateCustomer, 
    handleUpdateCustomer, 
    handleDeleteCustomer 
  } = useCustomers();

  // Custom hook for managing table state and interactions
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

  // State for managing success/error notifications
  const [notification, setNotification] = useState({
    open: false,
    message: ''
  });

  // Load customers data on component mount
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  /**
   * Handles the submission of customer data (create/update)
   * @param data - Customer data to be saved
   */
  const handleSubmit = async (data: CreateCustomerData) => {
    try {
      if (selectedCustomer) {
        // Update existing customer
        await handleUpdateCustomer(selectedCustomer.id, data);
        handleCloseDialogs(); // Cerramos el diálogo primero
        setNotification({
          open: true,
          message: 'Customer updated successfully'
        });
      } else {
        // Create new customer
        await handleCreateCustomer(data);
        handleCloseDialogs(); // Cerramos el diálogo primero
        setNotification({
          open: true,
          message: 'Customer created successfully'
        });
      }
      await loadCustomers(); // Recargamos los datos después de cerrar
    } catch (error) {
      console.error('Error:', error);
      setNotification({
        open: true,
        message: 'An error occurred while saving the customer'
      });
    }
  };

  /**
   * Handles partial updates to customer data
   * @param customerId - ID of the customer to update
   * @param data - Partial customer data to update
   */
  const handleUpdatePartial = async (customerId: number, data: Partial<CreateCustomerData>) => {
    try {
      if (data.customer || data.projects) { // Modificar esta condición para incluir projects
        await handleUpdateCustomer(customerId, data);
        handleCloseDialogs();
        setNotification({
          open: true,
          message: 'Changes saved successfully'
        });
        await loadCustomers();
      }
    } catch (error) {
      console.error('Update error details:', error);
      setNotification({
        open: true,
        message: error instanceof Error ? error.message : 'An error occurred while saving changes'
      });
    }
  };

  /**
   * Handles customer deletion confirmation
   */
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

  /**
   * Closes the notification snackbar
   */
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Loading state render
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

  // Error state render
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

  // Main render
  return (
    <Box>
      {/* Header section with create button */}
      <CustomerManagementHeader onCreateNew={handleOpenCreateDialog} />

      {/* Main customer table card */}
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

      {/* Dialogs for creating/editing and deleting customers */}
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

      {/* Notification component for success/error messages */}
      <SuccessNotification
        open={notification.open}
        message={notification.message}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default CustomerManagement;