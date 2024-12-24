// frontend/src/admin/customers/components/form-fields/FormTextField.tsx
import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface FormTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
  name: string;
  onChange: (name: string, value: string) => void;
}

export const FormTextField: React.FC<FormTextFieldProps> = ({
  name,
  onChange,
  ...props
}) => {
  return (
    <TextField
      {...props}
      onChange={(e) => onChange(name, e.target.value)}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 1
        },
        ...props.sx
      }}
    />
  );
};