// src/admin/customers/components/form-fields/ContactFields.tsx
import React from 'react';
import { Grid } from '@mui/material';
import { FormTextField } from './FormTextField';

interface ContactFieldsProps {
  data: {
    phone: string | undefined;
    email: string | undefined;
  };
  onChange: (name: string, value: string) => void;
}

export const ContactFields: React.FC<ContactFieldsProps> = ({
  data,
  onChange
}) => {
  return (
    <>
      <Grid item xs={12} sm={6}>
        <FormTextField
          fullWidth
          name="phone"
          label="Phone"
          value={data.phone || ''}
          onChange={onChange}
          inputProps={{ maxLength: 20 }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormTextField
          fullWidth
          name="email"
          label="Email"
          type="email"
          value={data.email || ''}
          onChange={onChange}
          inputProps={{ maxLength: 100 }}
        />
      </Grid>
    </>
  );
};