// frontend/src/admin/customers/CustomersTable.tsx
import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableContainer,
} from '@mui/material';
import { Customer } from './types';
import CustomerTableHeader from './components/CustomerTableHeader';
import CustomerTableRow from './components/CustomerTableRow';
import CustomerSearchBar from './components/CustomerSearchBar';

interface CustomersTableProps {
  customers: Customer[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete
}) => {
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
    <>
      <CustomerSearchBar 
        value={searchTerm}
        onChange={onSearchChange}
      />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <CustomerTableHeader />
          <TableBody>
            {filteredCustomers.map((customer) => (
              <CustomerTableRow
                key={customer.id}
                customer={customer}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default CustomersTable;