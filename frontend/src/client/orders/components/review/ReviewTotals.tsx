// frontend/src/client/components/orders/review/ReviewTotals.tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { InventoryItem } from '../../../../shared/types/shipping';

interface TotalsProps {
  selectedItems: InventoryItem[];
  orderNotes?: string;
  compact?: boolean;
}

const ReviewTotals: React.FC<TotalsProps> = ({
  selectedItems,
  orderNotes,
  compact = false
}) => {
  const totalItems = selectedItems.length;
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  if (compact) {
    return (
      <Box sx={{ 
        display: 'flex',
        gap: 2,
      }}>
        <Paper sx={{ 
          px: 2,
          py: 1,
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: '120px',
          justifyContent: 'center'
        }}>
          <Typography variant="subtitle2">Items:</Typography>
          <Typography variant="subtitle1" fontWeight="bold">
            {totalItems}
          </Typography>
        </Paper>
        
        <Paper sx={{ 
          px: 2,
          py: 1,
          bgcolor: 'success.main', 
          color: 'success.contrastText',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: '120px',
          justifyContent: 'center'
        }}>
          <Typography variant="subtitle2">Quantity:</Typography>
          <Typography variant="subtitle1" fontWeight="bold">
            {totalQuantity}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex',
      justifyContent: 'flex-start',
      gap: 2,
    }}>
      <Paper sx={{ 
        px: 3,
        py: 2,
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '160px'
      }}>
        <Typography variant="h4" fontWeight="bold">
          {totalItems}
        </Typography>
        <Typography variant="subtitle2">
          Total Items
        </Typography>
      </Paper>
      
      <Paper sx={{ 
        px: 3,
        py: 2,
        bgcolor: 'success.main', 
        color: 'success.contrastText',
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '160px'
      }}>
        <Typography variant="h4" fontWeight="bold">
          {totalQuantity}
        </Typography>
        <Typography variant="subtitle2">
          Total Quantity
        </Typography>
      </Paper>

      {orderNotes && (
        <Box sx={{ display: 'none' }}>
          <Typography variant="subtitle2" color="textSecondary">
            {orderNotes}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ReviewTotals;