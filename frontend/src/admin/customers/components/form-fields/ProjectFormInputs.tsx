// src/admin/customers/components/form-fields/ProjectFormInputs.tsx
import React from 'react';
import { TextField, Box } from '@mui/material';

interface ProjectFormInputsProps {
  values: {
    lookupCode: string;
    name: string;
    description?: string; // Hacemos description opcional
  };
  onChange: (field: string, value: string) => void;
}

export const ProjectFormInputs: React.FC<ProjectFormInputsProps> = ({
  values,
  onChange
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <TextField
        label="Project Code"
        value={values.lookupCode}
        onChange={(e) => onChange('lookupCode', e.target.value)}
        size="small"
        sx={{ minWidth: 150 }}
      />
      <TextField
        label="Name"
        value={values.name}
        onChange={(e) => onChange('name', e.target.value)}
        size="small"
        sx={{ minWidth: 200 }}
      />
      <TextField
        label="Description"
        value={values.description || ''} // Manejamos el caso undefined
        onChange={(e) => onChange('description', e.target.value)}
        size="small"
        sx={{ flexGrow: 1 }}
      />
    </Box>
  );
};