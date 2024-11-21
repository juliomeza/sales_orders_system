// frontend/src/admin/customers/CustomerManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import CustomerDialog from './CustomerDialog';
import { useCustomers } from './useCustomers';
import { Customer } from './types';

const CustomerManagement: React.FC = () => {
  const { customers, loadCustomers, handleCreateCustomer, handleUpdateCustomer, handleDeleteCustomer } = useCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleOpenDialog = (customer: Customer | null = null) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = async (data: any) => {
    if (selectedCustomer) {
      await handleUpdateCustomer(selectedCustomer.id, data);
    } else {
      await handleCreateCustomer(data);
    }
    handleCloseDialog();
    loadCustomers();
  };

  const handleDelete = async (customer: Customer) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await handleDeleteCustomer(customer.id);
      loadCustomers();
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.lookupCode.toLowerCase().includes(searchLower) ||
      customer.name.toLowerCase().includes(searchLower) ||
      customer.city.toLowerCase().includes(searchLower) ||
      customer.state.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Customer Management</Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 1 }}
        >
          New Customer
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
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
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.lookupCode}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{`${customer.city}, ${customer.state}`}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {customer.projects?.map((project) => (
                          <Chip
                            key={project.id}
                            label={project.name}
                            size="small"
                            variant={project.isDefault ? "filled" : "outlined"}
                            color="primary"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>{customer._count?.users || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.status === 1 ? 'Active' : 'Inactive'}
                        color={customer.status === 1 ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(customer)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(customer)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <CustomerDialog
        open={isDialogOpen}
        customer={selectedCustomer}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default CustomerManagement;