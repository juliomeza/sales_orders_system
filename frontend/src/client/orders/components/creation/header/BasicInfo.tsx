// fronend/src/client/orders/components/creatiion/header/BasicInfo.tsx
import React from 'react';
import { Grid, TextField } from '@mui/material';
import { OrderData } from '../../../../../shared/types/shipping';

interface BasicInfoProps {
  orderData: OrderData;
  onOrderDataChange: (field: keyof OrderData, value: any) => void;
}

const BasicInfo: React.FC<BasicInfoProps> = ({
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
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: (theme) => theme.shape.borderRadius
            }
          }}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="PO No."
          value={orderData.poNo}
          onChange={(e) => onOrderDataChange('poNo', e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: (theme) => theme.shape.borderRadius
            }
          }}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Reference No."
          value={orderData.referenceNo}
          onChange={(e) => onOrderDataChange('referenceNo', e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: (theme) => theme.shape.borderRadius
            }
          }}
        />
      </Grid>
    </Grid>
  );
};

export default BasicInfo;