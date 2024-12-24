// frontend/src/admin/customers/components/dialog/CustomerDialogDelete.tsx
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

/**
 * Interface for the CustomerDeleteDialog component props
 * @interface CustomerDeleteDialogProps
 * @property {boolean} open - Controls the visibility of the dialog
 * @property {string} customerName - Name of the customer to be deleted
 * @property {() => void} onConfirm - Callback function to execute when deletion is confirmed
 * @property {() => void} onCancel - Callback function to execute when deletion is cancelled
 */
interface CustomerDeleteDialogProps {
  open: boolean;
  customerName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Component that displays a confirmation dialog for customer deletion
 * Includes warning message, customer name, and actions to confirm or cancel the deletion
 * Uses Material-UI's Dialog component with custom styling for warning presentation
 */
export const CustomerDeleteDialog: React.FC<CustomerDeleteDialogProps> = ({
  open,
  customerName,
  onConfirm,
  onCancel
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      {/* Dialog header with warning icon and title */}
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
      
      {/* Dialog content with warning message and customer information */}
      <DialogContent sx={{ py: 3 }}>
        {/* Primary confirmation message with customer name highlighted */}
        <Typography variant="body1">
          Are you sure you want to delete the customer{' '}
          <Box component="span" fontWeight="bold">{customerName}</Box>?
        </Typography>

        {/* Secondary warning message about permanent deletion */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This action cannot be undone. All customer data, including projects and users, will be permanently removed.
        </Typography>
      </DialogContent>
      
      {/* Action buttons for confirmation or cancellation */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        {/* Cancel button - Secondary action */}
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>

        {/* Delete button - Primary action with warning styling */}
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