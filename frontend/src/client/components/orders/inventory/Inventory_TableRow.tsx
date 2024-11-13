// frontend/src/client/components/orders/inventory/Inventory_TableRow.tsx
import React from 'react';
import {
  TableRow,
  TableCell,
  TextField,
  Button,
} from '@mui/material';
import { InventoryItem } from '../../../../shared/types/shipping';

interface TableRowProps {
  item: InventoryItem;
  inputValue: string;
  onQuantityChange: (itemId: string, value: string) => void;
  onAddItem: (item: InventoryItem) => void;
}

const Inventory_TableRow: React.FC<TableRowProps> = ({
  item,
  inputValue,
  onQuantityChange,
  onAddItem,
}) => {
  return (
    <TableRow sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
      <TableCell>{item.id}</TableCell>
      <TableCell>{item.lookupCode}</TableCell>
      <TableCell>{item.description}</TableCell>
      <TableCell align="right">{item.available}</TableCell>
      <TableCell align="right">
        <TextField
          type="number"
          size="small"
          value={inputValue || ''}
          onChange={(e) => onQuantityChange(item.id, e.target.value)}
          placeholder="Qty"
          inputProps={{ 
            min: 0, 
            max: item.available,
            style: { textAlign: 'right' }
          }}
          sx={{ 
            width: '80px',
            '& input::placeholder': {
              textAlign: 'center',
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
          disabled={!inputValue || parseInt(inputValue) <= 0 || parseInt(inputValue) > item.available}
          sx={{
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
  );
};

export default Inventory_TableRow;