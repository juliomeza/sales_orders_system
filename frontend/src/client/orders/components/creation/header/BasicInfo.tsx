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
  // Función para limpiar el campo
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.setAttribute('autocomplete', 'none');
    event.target.setAttribute('readonly', 'true');
    setTimeout(() => {
      event.target.removeAttribute('readonly');
    }, 100);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Order Lookup"
          name="order_lookup_prevent_autofill"
          value={orderData.orderLookup}
          onChange={(e) => onOrderDataChange('orderLookup', e.target.value)}
          onFocus={handleFocus}
          variant="outlined"
          autoComplete="chrome-off"
          spellCheck="false"
          inputProps={{
            autoComplete: 'off',
            autoCorrect: 'off',
            spellCheck: 'false',
            'data-form-type': 'other',
            'aria-autocomplete': 'none',
          }}
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
          name="po_no_prevent_autofill"
          value={orderData.poNo}
          onChange={(e) => onOrderDataChange('poNo', e.target.value)}
          onFocus={handleFocus}
          variant="outlined"
          autoComplete="chrome-off"
          spellCheck="false"
          inputProps={{
            autoComplete: 'off',
            autoCorrect: 'off',
            spellCheck: 'false',
            'data-form-type': 'other',
            'aria-autocomplete': 'none',
          }}
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
          name="reference_no_prevent_autofill"
          value={orderData.referenceNo}
          onChange={(e) => onOrderDataChange('referenceNo', e.target.value)}
          onFocus={handleFocus}
          variant="outlined"
          autoComplete="chrome-off"
          spellCheck="false"
          inputProps={{
            autoComplete: 'off',
            autoCorrect: 'off',
            spellCheck: 'false',
            'data-form-type': 'other',
            'aria-autocomplete': 'none',
          }}
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