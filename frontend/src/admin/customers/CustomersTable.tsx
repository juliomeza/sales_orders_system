// frontend/src/admin/customers/CustomersTable.tsx
import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Customer, Project } from './types';

interface CustomersTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  onEdit,
  onDelete,
}) => {
  return (
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
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.lookupCode}</TableCell>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{`${customer.city}, ${customer.state}`}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {customer.projects?.map((project: Project) => (
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
                  onClick={() => onEdit(customer)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(customer)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomersTable;