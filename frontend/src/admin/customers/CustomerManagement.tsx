// frontend/src/admin/customers/CustomerManagement.tsx
import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, InputAdornment, Button, Tab, Tabs } from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import CustomersTable from './CustomersTable';
import CustomerDialog from './CustomerDialog';
import CustomerCreationFlow from './CustomerCreationFlow';
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const CustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h1">
              Customer Management
            </Typography>
            {tabValue === 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setTabValue(1)}
              >
                New Customer
              </Button>
            )}
          </Box>
          
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Customer List" />
            <Tab label="Create Customer" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
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
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <CustomerCreationFlow />
        </TabPanel>
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