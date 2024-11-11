// src/components/orders/review/Review_OrderSummary.tsx
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
  shipToName: string;
  billToName: string;
}

const Review_OrderSummary: React.FC<OrderSummaryProps> = ({
  orderData,
  carrierName,
  shipToName,
  billToName,
}) => {
  return (
    <>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Order Details
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>PO Number:</strong> {orderData.poNo || '-'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Reference:</strong> {orderData.referenceNo || '-'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Order Class:</strong> {orderData.orderClass}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Shipping Details
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Carrier:</strong> {carrierName || '-'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Service:</strong> {orderData.serviceType || '-'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Expected Date:</strong>{' '}
            {orderData.expectedDate
              ? new Date(orderData.expectedDate).toLocaleDateString()
              : '-'}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Ship To Address
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Account:</strong> {shipToName}
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
        <Paper sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Bill To Address
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Account:</strong> {billToName}
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