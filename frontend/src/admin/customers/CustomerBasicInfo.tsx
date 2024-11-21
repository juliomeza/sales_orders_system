// frontend/src/admin/customers/CustomerBasicInfo.tsx
import React from 'react';
import {
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Alert,
} from '@mui/material';

interface CustomerData {
  lookupCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  status: number;
}

interface CustomerBasicInfoProps {
  data: CustomerData;
  onChange: (data: CustomerData) => void;
}

const CustomerBasicInfo: React.FC<CustomerBasicInfoProps> = ({
  data,
  onChange,
}) => {
  const handleChange = (field: keyof CustomerData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({
      ...data,
      [field]: event.target.value,
    });
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...data,
      status: event.target.checked ? 1 : 2,
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Fields marked with * are required
      </Alert>

      <Grid container spacing={3}>
        {/* Código y Nombre */}
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Customer Code"
            value={data.lookupCode}
            onChange={handleChange('lookupCode')}
            inputProps={{ maxLength: 20 }}
            helperText="Unique identifier for the customer"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Customer Name"
            value={data.name}
            onChange={handleChange('name')}
            inputProps={{ maxLength: 100 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />
        </Grid>

        {/* Dirección */}
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Address"
            value={data.address}
            onChange={handleChange('address')}
            inputProps={{ maxLength: 200 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />
        </Grid>

        {/* Ciudad, Estado y Código Postal */}
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="City"
            value={data.city}
            onChange={handleChange('city')}
            inputProps={{ maxLength: 100 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label="State"
            value={data.state}
            onChange={handleChange('state')}
            inputProps={{ maxLength: 2 }}
            helperText="2-letter state code"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label="ZIP Code"
            value={data.zipCode}
            onChange={handleChange('zipCode')}
            inputProps={{ maxLength: 10 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />
        </Grid>

        {/* Información de Contacto */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            value={data.phone || ''}
            onChange={handleChange('phone')}
            inputProps={{ maxLength: 20 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={data.email || ''}
            onChange={handleChange('email')}
            inputProps={{ maxLength: 100 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1
              }
            }}
          />
        </Grid>

        {/* Estado */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={data.status === 1}
                onChange={handleStatusChange}
                color="primary"
              />
            }
            label={
              <Box component="span" sx={{ color: data.status === 1 ? 'success.main' : 'text.secondary' }}>
                {data.status === 1 ? 'Active' : 'Inactive'}
              </Box>
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerBasicInfo;