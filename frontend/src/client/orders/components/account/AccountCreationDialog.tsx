// frontend/src/client/orders/components/account/AccountCreationDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Typography
} from '@mui/material';
import { ShippingAddress } from '../../../../shared/types/shipping';

interface AccountCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateAccount: (account: Omit<ShippingAddress, 'id'>) => Promise<ShippingAddress>;
  type: 'shipping' | 'billing';
  isCreating: boolean;
}

const AccountCreationDialog: React.FC<AccountCreationDialogProps> = ({
  open,
  onClose,
  onCreateAccount,
  type,
  isCreating
}) => {
  const [newAccount, setNewAccount] = useState<Omit<ShippingAddress, 'id'>>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const accountTypeLabel = type === 'shipping' ? 'Shipping' : 'Billing';

  const handleSubmit = async () => {
    try {
      await onCreateAccount(newAccount);
      handleClose();
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const handleClose = () => {
    setNewAccount({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    });
    onClose();
  };

  const labelStyles = {
    '& .MuiInputLabel-shrink': {
      transform: 'translate(14px, -3px) scale(0.75)',
      background: '#fff',
      padding: '0 8px'
    }
  };

  const isFormValid = newAccount.name && 
    newAccount.address && 
    newAccount.city && 
    newAccount.state && 
    newAccount.zipCode;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        py: 2
      }}>
        Create New {accountTypeLabel} Account
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Account Name"
              fullWidth
              value={newAccount.name}
              onChange={(e) => setNewAccount(prev => ({
                ...prev,
                name: e.target.value
              }))}
              variant="outlined"
              sx={labelStyles}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Street Address"
              fullWidth
              value={newAccount.address}
              onChange={(e) => setNewAccount(prev => ({
                ...prev,
                address: e.target.value
              }))}
              variant="outlined"
              sx={labelStyles}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="City"
              fullWidth
              value={newAccount.city}
              onChange={(e) => setNewAccount(prev => ({
                ...prev,
                city: e.target.value
              }))}
              variant="outlined"
              sx={labelStyles}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              label="State"
              fullWidth
              value={newAccount.state}
              onChange={(e) => setNewAccount(prev => ({
                ...prev,
                state: e.target.value
              }))}
              variant="outlined"
              sx={labelStyles}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              label="ZIP Code"
              fullWidth
              value={newAccount.zipCode}
              onChange={(e) => setNewAccount(prev => ({
                ...prev,
                zipCode: e.target.value
              }))}
              variant="outlined"
              sx={labelStyles}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={isCreating}
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isCreating || !isFormValid}
        >
          {isCreating ? 'Creating...' : 'Create Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountCreationDialog;