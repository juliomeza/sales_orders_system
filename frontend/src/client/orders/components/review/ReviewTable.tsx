// frontend/src/client/components/orders/review/ReviewTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { InventoryItem } from '../../../../shared/types/shipping';

interface ReviewTableProps {
  selectedItems: InventoryItem[];
  onRemoveItem: (itemId: string) => void;
  isSubmitted: boolean;
}

const Review_Table: React.FC<ReviewTableProps> = ({
  selectedItems,
  onRemoveItem,
  isSubmitted,
}) => {
  return (
    <TableContainer 
      component={Paper} 
      sx={(theme) => ({ 
        mt: 3,
        borderRadius: theme.shape.borderRadius,
        elevation: 0
      })}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell>Material ID</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Packaging</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {selectedItems.map((item) => (
            <TableRow 
              key={item.id}
              sx={{ 
                '&:hover': { 
                  bgcolor: 'grey.50'
                }
              }}
            >
              <TableCell>{item.lookupCode}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.packaging}</TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell>
                <IconButton 
                  onClick={() => onRemoveItem(item.id)}
                  size="small"
                  disabled={isSubmitted}
                  sx={{ 
                    color: isSubmitted ? 'grey.400' : 'error.main',
                    '&:hover': {
                      bgcolor: isSubmitted ? 'transparent' : 'error.light',
                      color: isSubmitted ? 'grey.400' : 'error.dark',
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Review_Table;