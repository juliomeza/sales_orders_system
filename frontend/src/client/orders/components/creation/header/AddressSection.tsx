// frontend/src/client/orders/components/creation/header/AddressSection.tsx
import React from 'react';
import {
  Grid,
  FormControlLabel,
  Checkbox,
  TextField,
  Alert,
  CircularProgress,
  Box,
  styled
} from '@mui/material';
import { OrderData } from '../../../../../shared/types/shipping';
import AccountSelector from '../../AccountSelector';
import { useAccounts } from '../../../../../shared/hooks/useAccounts';

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
  }
}));

interface AddressSectionProps {
  orderData: OrderData;
  onOrderDataChange: (field: keyof OrderData, value: any) => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({
  orderData,
  onOrderDataChange
}) => {
  const {
    accounts,
    isLoading,
    error,
    isDifferentBillTo,
    setIsDifferentBillTo,
    handleShipToChange,
    handleBillToChange,
    createNewAccount
  } = useAccounts(orderData.shipToAccount, orderData.billToAccount);

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        p: 3 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
      >
        {error}
      </Alert>
    );
  }

  const handleShipToChangeWrapper = async (accountId: string, address?: any) => {
    handleShipToChange(accountId, address);
    onOrderDataChange('shipToAccount', accountId);
    if (address) {
      onOrderDataChange('shipToAddress', address);
      if (!isDifferentBillTo) {
        onOrderDataChange('billToAccount', accountId);
        onOrderDataChange('billToAddress', address);
      }
    }
  };

  const handleBillToChangeWrapper = (accountId: string, address?: any) => {
    handleBillToChange(accountId, address);
    onOrderDataChange('billToAccount', accountId);
    if (address) {
      onOrderDataChange('billToAddress', address);
    }
  };

  const handleDifferentBillToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setIsDifferentBillTo(newValue);
    
    if (!newValue && orderData.shipToAddress) {
      handleBillToChangeWrapper(orderData.shipToAccount, orderData.shipToAddress);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <AccountSelector
          accounts={accounts}
          value={orderData.shipToAccount}
          onChange={handleShipToChangeWrapper}
          type="shipping"
          label="Account (Shipping)"
          onCreateAccount={createNewAccount}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <AccountSelector
          accounts={accounts}
          value={orderData.billToAccount}
          onChange={handleBillToChangeWrapper}
          disabled={!isDifferentBillTo}
          type="billing"
          label="Account (Billing)"
          onCreateAccount={createNewAccount}
        />
      </Grid>

      <Grid item xs={12} md={4} sx={{ 
        display: 'flex', 
        alignItems: 'flex-start',
        pt: 2 
      }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isDifferentBillTo}
              onChange={handleDifferentBillToChange}
              name="differentBillTo"
            />
          }
          label="Different Bill To Address"
        />
      </Grid>

      <Grid item xs={12}>
        <StyledTextField
          multiline
          rows={4}
          label="Order Notes"
          value={orderData.orderNotes}
          onChange={(e) => onOrderDataChange('orderNotes', e.target.value)}
          variant="outlined"
        />
      </Grid>
    </Grid>
  );
};

export default AddressSection;