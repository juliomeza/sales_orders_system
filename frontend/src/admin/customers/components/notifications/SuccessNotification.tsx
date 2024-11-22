import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';

export interface SuccessNotificationProps {
  open: boolean;
  onClose: () => void;
  message: string;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  open,
  onClose,
  message
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        icon={<CheckCircleOutline />}
        onClose={onClose}
        severity="success"
        variant="filled"
        sx={{
          minWidth: '300px',
          justifyContent: 'center',
          alignItems: 'center',
          '.MuiAlert-icon': {
            fontSize: '1.5rem'
          },
          '.MuiAlert-message': {
            fontSize: '1rem',
            fontWeight: 500
          }
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SuccessNotification;