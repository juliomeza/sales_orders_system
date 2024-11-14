// frontend/src/client/components/orders/inventory/Inventory_Table.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button
} from '@mui/material';
import { InventoryItem } from '../../../../shared/types/shipping';

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
    <TableContainer 
      component={Paper} 
      sx={{ 
        boxShadow: 'none',
        borderRadius: 1
      }}
    >
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
            <TableRow 
              key={item.id}
              sx={{ '&:hover': { bgcolor: 'grey.50' } }}
            >
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.lookupCode}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell align="right">{item.available}</TableCell>
              <TableCell align="right">
                <TextField
                  type="number"
                  size="small"
                  value={inputValues[item.id] || ''}
                  onChange={(e) => onQuantityChange(item.id, e.target.value)}
                  placeholder="Qty"
                  inputProps={{ 
                    min: 0, 
                    max: item.available,
                    style: { textAlign: 'right' }
                  }}
                  sx={{ 
                    width: '80px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                />
              </TableCell>
              <TableCell>{item.packaging}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onAddItem(item)}
                  disabled={!inputValues[item.id] || parseInt(inputValues[item.id]) <= 0 || parseInt(inputValues[item.id]) > item.available}
                  sx={{
                    borderRadius: 1,
                    textTransform: 'none',
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  Add
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Inventory_Table;