// src/components/orders/inventory/Inventory_Table.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { InventoryItem } from '../../../types/shipping';
import Inventory_TableRow from './Inventory_TableRow';

interface TableProps {
  inventory: InventoryItem[];
  inputValues: Record<string, string>;
  onQuantityChange: (itemId: string, value: string) => void;
  onAddItem: (item: InventoryItem) => void;
}

const Inventory_Table: React.FC<TableProps> = ({
  inventory,
  inputValues,
  onQuantityChange,
  onAddItem,
}) => {
  return (
    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell>Material ID</TableCell>
            <TableCell>Lookup Code</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Available</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell>Packaging</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inventory.map((item) => (
            <Inventory_TableRow
              key={item.id}
              item={item}
              inputValue={inputValues[item.id] || ''}
              onQuantityChange={onQuantityChange}
              onAddItem={onAddItem}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Inventory_Table;