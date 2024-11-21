// frontend/src/admin/customers/CustomersTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Customer } from './CustomerManagement';

interface CustomersTableProps {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  isLoading,
  error,
  onEdit,
  onDelete,
}) => {
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    customer: Customer | null;
  }>({
    open: false,
    customer: null
  });

  const handleDeleteClick = (customer: Customer) => {
    setDeleteDialog({
      open: true,
      customer
    });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.customer) {
      onDelete(deleteDialog.customer);
      setDeleteDialog({ open: false, customer: null });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Projects</TableCell>
              <TableCell>Users</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow 
                key={customer.id}
                sx={{ '&:hover': { bgcolor: 'grey.50' } }}
              >
                <TableCell>{customer.lookupCode}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{`${customer.city}, ${customer.state}`}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {customer.projects.map((project) => (
                      <Chip
                        key={project.id}
                        label={project.name}
                        size="small"
                        color={project.isDefault ? "primary" : "default"}
                        variant={project.isDefault ? "filled" : "outlined"}
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>{customer._count.users}</TableCell>
                <TableCell>
                  <Chip
                    label={customer.status === 1 ? "Active" : "Inactive"}
                    color={customer.status === 1 ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    onClick={() => onEdit(customer)}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDeleteClick(customer)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, customer: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete customer "{deleteDialog.customer?.name}"?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, customer: null })}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomersTable;