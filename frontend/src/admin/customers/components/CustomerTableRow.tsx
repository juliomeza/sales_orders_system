// frontend/src/admin/customers/components/CustomerTableRow.tsx
import React from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Chip,
  Box
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Customer } from '../types';

interface CustomerTableRowProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const CustomerTableRow: React.FC<CustomerTableRowProps> = ({
  customer,
  onEdit,
  onDelete
}) => {
  return (
    <TableRow>
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
  );
};

export default CustomerTableRow;