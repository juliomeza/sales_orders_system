// frontend/src/client/components/orders/review/Review_Totals.tsx
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
} from '@mui/material';
import { InventoryItem } from '../../../../shared/types/shipping';

interface TotalsProps {
  selectedItems: InventoryItem[];
  orderNotes?: string;
}

const Review_Totals: React.FC<TotalsProps> = ({
  selectedItems,
  orderNotes,
}) => {
  const totalItems = selectedItems.length;
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Grid item xs={12}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 4,
          gap: 2 
        }}>
          <Paper sx={{ 
            p: 3, 
            flex: 1, 
            bgcolor: 'primary.main', 
            color: 'white',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {totalItems}
            </Typography>
            <Typography>Total Items</Typography>
          </Paper>
          
          <Paper sx={{ 
            p: 3, 
            flex: 1, 
            bgcolor: 'success.main', 
            color: 'white',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {totalQuantity}
            </Typography>
            <Typography>Total Quantity</Typography>
          </Paper>
        </Box>
      </Grid>

      {orderNotes && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Order Notes
            </Typography>
            <Typography variant="body2">
              {orderNotes}
            </Typography>
          </Paper>
        </Grid>
      )}
    </>
  );
};

export default Review_Totals;