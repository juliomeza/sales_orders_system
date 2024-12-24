// frontend/src/admin/customers/components/form-fields/CustomerCodeField.tsx
import React from 'react';
import { FormTextField } from './FormTextField';

interface CustomerCodeFieldProps {
  value: string;
  onChange: (name: string, value: string) => void;
}

export const CustomerCodeField: React.FC<CustomerCodeFieldProps> = ({
  value,
  onChange
}) => {
  return (
    <FormTextField
      required
      fullWidth
      name="lookupCode"
      label="Customer Code"
      value={value}
      onChange={onChange}
      inputProps={{ maxLength: 20 }}
      helperText="Unique identifier for the customer"
    />
  );
};