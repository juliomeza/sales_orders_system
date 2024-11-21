// src/admin/customers/components/dialog/CustomerDialogDelete.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { WarningAmberRounded } from '@mui/icons-material';

interface CustomerDeleteDialogProps {
  open: boolean;
  customerName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CustomerDeleteDialog: React.FC<CustomerDeleteDialogProps> = ({
  open,
  customerName,
  onConfirm,
  onCancel
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        bgcolor: 'error.main', 
        color: 'error.contrastText',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <WarningAmberRounded />
        Confirm Delete
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body1">
          Are you sure you want to delete the customer <Box component="span" fontWeight="bold">{customerName}</Box>?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This action cannot be undone. All customer data, including projects and users, will be permanently removed.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error"
          startIcon={<WarningAmberRounded />}
        >
          Delete Customer
        </Button>
      </DialogActions>
    </Dialog>
  );
};