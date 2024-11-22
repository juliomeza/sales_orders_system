// src/admin/customers/components/form-fields/AddressFields.tsx
import React from 'react';
import { Grid } from '@mui/material';
import { FormTextField } from './FormTextField';

interface AddressFieldsProps {
  data: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  onChange: (name: string, value: string) => void;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({
  data,
  onChange
}) => {
  return (
    <>
      <Grid item xs={12}>
        <FormTextField
          required
          fullWidth
          name="address"
          label="Address"
          value={data.address}
          onChange={onChange}
          inputProps={{ maxLength: 200 }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormTextField
          required
          fullWidth
          name="city"
          label="City"
          value={data.city}
          onChange={onChange}
          inputProps={{ maxLength: 100 }}
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormTextField
          required
          fullWidth
          name="state"
          label="State"
          value={data.state}
          onChange={onChange}
          inputProps={{ maxLength: 2 }}
          helperText="2-letter state code"
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormTextField
          required
          fullWidth
          name="zipCode"
          label="ZIP Code"
          value={data.zipCode}
          onChange={onChange}
          inputProps={{ maxLength: 10 }}
        />
      </Grid>
    </>
  );
};