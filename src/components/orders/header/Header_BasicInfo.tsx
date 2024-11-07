// src/components/orders/header/Header_BasicInfo.tsx
import React from 'react';
import {
  Grid,
  TextField,
} from '@mui/material';
import { OrderData } from '../../../types/shipping';

interface BasicInfoProps {
  orderData: OrderData;
  onOrderDataChange: (field: keyof OrderData, value: any) => void;
}

const Header_BasicInfo: React.FC<BasicInfoProps> = ({
  orderData,
  onOrderDataChange,
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Order Lookup"
          value={orderData.orderLookup}
          onChange={(e) => onOrderDataChange('orderLookup', e.target.value)}
          variant="outlined"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="PO No."
          value={orderData.poNo}
          onChange={(e) => onOrderDataChange('poNo', e.target.value)}
          variant="outlined"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Reference No."
          value={orderData.referenceNo}
          onChange={(e) => onOrderDataChange('referenceNo', e.target.value)}
          variant="outlined"
        />
      </Grid>
    </Grid>
  );
};

export default Header_BasicInfo;