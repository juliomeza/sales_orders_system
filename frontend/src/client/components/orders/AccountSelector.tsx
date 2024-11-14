// frontend/src/client/components/orders/AccountSelector.tsx
import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface ShippingAddress {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface AccountSelectorProps {
  accounts: ShippingAddress[];
  value: string;
  onChange: (value: string, address?: ShippingAddress) => void;
  onCreateAccount: (account: Omit<ShippingAddress, 'id'>) => Promise<ShippingAddress>;
  disabled?: boolean;
  type: 'shipping' | 'billing';
  label?: string;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  value,
  onChange,
  onCreateAccount,
  disabled,
  type,
  label
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newAccount, setNewAccount] = useState<Omit<ShippingAddress, 'id'>>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const selectedAccount = accounts.find(acc => acc.id === value);
  const accountTypeLabel = type === 'shipping' ? 'Shipping' : 'Billing';
  const displayLabel = label || `Account (${accountTypeLabel})`;

  const handleCreateAccount = async () => {
    setIsCreating(true);
    try {
      const createdAccount = await onCreateAccount(newAccount);
      onChange(createdAccount.id, createdAccount);
      setIsDialogOpen(false);
      setShowSuccessMessage(true);
      setNewAccount({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
      });
    } catch (error) {
      console.error('Error creating account:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const labelStyles = {
    '& .MuiInputLabel-shrink': {
      transform: 'translate(14px, -3px) scale(0.75)',
      background: '#fff',
      padding: '0 8px'
    }
  };

  return (
    <Box>
      <Autocomplete
        value={selectedAccount || null}
        onChange={(_, newValue) => {
          if (newValue) {
            onChange(newValue.id, newValue);
          } else {
            onChange('');
          }
        }}
        options={accounts}
        getOptionLabel={(option) => option.name}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body1">
                {option.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.address}, {option.city}, {option.state} {option.zipCode}
              </Typography>
            </Box>
          </Box>
        )}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label={displayLabel}
            variant="outlined"
            placeholder={`Search or select ${accountTypeLabel.toLowerCase()} account`}
            fullWidth
            sx={labelStyles}
          />
        )}
        ListboxProps={{
          sx: { maxHeight: '256px' }
        }}
      />

      <Button
        startIcon={<AddIcon />}
        onClick={() => setIsDialogOpen(true)}
        sx={{ mt: 1 }}
        size="small"
        disabled={disabled}
      >
        Create New {accountTypeLabel} Account
      </Button>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
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
                onChange={(e) => setNewAccount((prev) => ({
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
                onChange={(e) => setNewAccount((prev) => ({
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
                onChange={(e) => setNewAccount((prev) => ({
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
                onChange={(e) => setNewAccount((prev) => ({
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
                onChange={(e) => setNewAccount((prev) => ({
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
            onClick={() => setIsDialogOpen(false)}
            variant="outlined"
            disabled={isCreating}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateAccount}
            variant="contained"
            disabled={isCreating || !newAccount.name || !newAccount.address || !newAccount.city || !newAccount.state || !newAccount.zipCode}
          >
            {isCreating ? 'Creating...' : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={showSuccessMessage} 
        autoHideDuration={4000} 
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccessMessage(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {accountTypeLabel} account created successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountSelector;