// frontend/src/client/components/orders/review/ReviewOrderSummary.tsx
import React from 'react';
import {
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { OrderData } from '../../../../shared/types/shipping';

interface OrderSummaryProps {
  orderData: OrderData;
  carrierName: string;
  carrierService: string;
  shipToName: string;
  billToName: string;
}

const Review_OrderSummary: React.FC<OrderSummaryProps> = ({
  orderData,
  carrierName,
  carrierService,
  shipToName,
  billToName,
}) => {
  return (
    <>
      {/* Order Details */}
      <Grid item xs={12} md={3}>
        <Paper sx={{ 
          p: 3, 
          height: '100%', 
          backgroundColor: (theme) => theme.palette.grey[50]
        }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Order Details
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <Typography component="span" fontWeight="bold">PO Number:</Typography> {orderData.poNo || '-'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <Typography component="span" fontWeight="bold">Reference:</Typography> {orderData.referenceNo || '-'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <Typography component="span" fontWeight="bold">Order Class:</Typography> {orderData.orderClass}
          </Typography>
        </Paper>
      </Grid>

      {/* Shipping Details */}
      <Grid item xs={12} md={3}>
        <Paper sx={{ 
          p: 3, 
          height: '100%', 
          backgroundColor: (theme) => theme.palette.grey[50]
        }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Shipping Details
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <Typography component="span" fontWeight="bold">Carrier:</Typography> {carrierName || '-'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <Typography component="span" fontWeight="bold">Service:</Typography> {carrierService || '-'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <Typography component="span" fontWeight="bold">Expected Date:</Typography>{' '}
            {orderData.expectedDate
              ? new Date(orderData.expectedDate).toLocaleDateString()
              : '-'}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper sx={{ 
          p: 3, 
          height: '100%', 
          backgroundColor: (theme) => theme.palette.grey[50]
        }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Ship To Address
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <Typography component="span" fontWeight="bold">Account:</Typography> {shipToName}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {orderData.shipToAddress.address}
          </Typography>
          <Typography variant="body2">
            {orderData.shipToAddress.city}, {orderData.shipToAddress.state} {orderData.shipToAddress.zipCode}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper sx={{ 
          p: 3, 
          height: '100%', 
          backgroundColor: (theme) => theme.palette.grey[50]
        }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Bill To Address
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <Typography component="span" fontWeight="bold">Account:</Typography> {billToName}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {orderData.billToAddress.address}
          </Typography>
          <Typography variant="body2">
            {orderData.billToAddress.city}, {orderData.billToAddress.state} {orderData.billToAddress.zipCode}
          </Typography>
        </Paper>
      </Grid>
    </>
  );
};

export default Review_OrderSummary;