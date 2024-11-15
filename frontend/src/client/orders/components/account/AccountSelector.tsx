// frontend/src/client/orders/components/account/AccountSelector.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ShippingAddress } from '../../../../shared/types/shipping';
import AccountSearchField from './AccountSearchField';
import AccountCreationDialog from './AccountCreationDialog';

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

  const selectedAccount = accounts.find(acc => acc.id === value);
  const accountTypeLabel = type === 'shipping' ? 'Shipping' : 'Billing';

  const handleCreateAccount = async (newAccount: Omit<ShippingAddress, 'id'>) => {
    setIsCreating(true);
    try {
      const createdAccount = await onCreateAccount(newAccount);
      onChange(createdAccount.id, createdAccount);
      setIsDialogOpen(false);
      setShowSuccessMessage(true);
      return createdAccount;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box>
      <AccountSearchField
        accounts={accounts}
        value={selectedAccount || null}
        onChange={onChange}
        disabled={disabled}
        type={type}
        label={label}
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

      <AccountCreationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreateAccount={handleCreateAccount}
        type={type}
        isCreating={isCreating}
      />

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