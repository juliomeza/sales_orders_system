// frontend/src/admin/customers/components/forms/BasicInfoForm.tsx
import React from 'react';
import { Grid, Typography, Alert, Box } from '@mui/material';
import { CustomerCodeField } from '../form-fields/CustomerCodeField';
import { AddressFields } from '../form-fields/AddressFields';
import { ContactFields } from '../form-fields/ContactFields';
import { StatusToggle } from '../form-fields/StatusToggle';
import { FormTextField } from '../form-fields/FormTextField';
import { Customer } from '../../types';

interface BasicInfoFormProps {
  data: Partial<Customer>;
  onChange: (data: Partial<Customer>) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  data,
  onChange
}) => {
  const handleFieldChange = (field: string, value: string | number) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>

      <Grid container spacing={3}>
        {/* Customer Code and Name */}
        <Grid item xs={12} sm={6}>
          <CustomerCodeField
            value={data.lookupCode || ''}
            onChange={handleFieldChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormTextField
            required
            fullWidth
            name="name"
            label="Customer Name"
            value={data.name || ''}
            onChange={handleFieldChange}
            inputProps={{ maxLength: 100 }}
          />
        </Grid>

        {/* Address Fields */}
        <AddressFields
          data={{
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zipCode || ''
          }}
          onChange={handleFieldChange}
        />

        {/* Contact Fields */}
        <ContactFields
          data={{
            phone: data.phone,
            email: data.email
          }}
          onChange={handleFieldChange}
        />

        {/* Status Toggle */}
        <Grid item xs={12}>
          <StatusToggle
            value={data.status || 1}
            onChange={handleFieldChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BasicInfoForm;