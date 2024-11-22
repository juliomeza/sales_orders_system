// frontend/src/admin/customers/components/tables/CustomerTableHeader.tsx
import React from 'react';
import {
  TableHead,
  TableRow,
  TableCell,
} from '@mui/material';

export const CUSTOMER_TABLE_COLUMNS = [
  { id: 'code', label: 'Code' },
  { id: 'name', label: 'Name' },
  { id: 'location', label: 'Location' },
  { id: 'projects', label: 'Projects' },
  { id: 'users', label: 'Users' },
  { id: 'status', label: 'Status' },
  { id: 'actions', label: '', align: 'right' as const }
];

const CustomerTableHeader: React.FC = () => {
  return (
    <TableHead>
      <TableRow>
        {CUSTOMER_TABLE_COLUMNS.map((column) => (
          <TableCell
            key={column.id}
            align={column.align}
          >
            {column.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default CustomerTableHeader;