// src/components/validation/ValidationErrors.tsx
import React from 'react';
import { Alert, AlertTitle, Box, Collapse } from '@mui/material';

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationErrorsProps {
  errors: ValidationError[];
  show: boolean;
}

const ValidationErrors: React.FC<ValidationErrorsProps> = ({
  errors,
  show
}) => {
  if (errors.length === 0) return null;

  return (
    <Collapse in={show}>
      <Box sx={{ mt: 2 }}>
        <Alert 
          severity="error"
          variant="outlined"
          sx={{
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <AlertTitle>Please correct the following errors:</AlertTitle>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {errors.map((error, index) => (
              <li key={`${error.field}_${index}`}>
                {error.message}
              </li>
            ))}
          </ul>
        </Alert>
      </Box>
    </Collapse>
  );
};

export default ValidationErrors;