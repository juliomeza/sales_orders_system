// src/components/orders/header/Header_ShippingInfo.tsx
import React from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { OrderData } from '../../../types/shipping';
import { useShipping } from '../../../hooks/useShipping';

interface ShippingInfoProps {
  orderData: OrderData;
  onOrderDataChange: (field: keyof OrderData, value: any) => void;
}

const Header_ShippingInfo: React.FC<ShippingInfoProps> = ({
  orderData,
  onOrderDataChange,
}) => {
  const {
    carriers,
    warehouses,
    isLoading,
    error,
    availableServices,
    setSelectedCarrierId,
    setSelectedService,
    setSelectedWarehouseId,
  } = useShipping(
    orderData.carrier,
    orderData.preferredWarehouse,
    orderData.serviceType
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const handleCarrierChange = (carrierId: string) => {
    setSelectedCarrierId(carrierId);
    onOrderDataChange('carrier', carrierId);
    onOrderDataChange('serviceType', '');
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Carrier</InputLabel>
          <Select
            value={orderData.carrier}
            onChange={(e) => handleCarrierChange(e.target.value)}
            label="Carrier"
          >
            {carriers.map((carrier) => (
              <MenuItem key={carrier.id} value={carrier.id}>
                {carrier.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Service Type</InputLabel>
          <Select
            value={orderData.serviceType}
            onChange={(e) => {
              setSelectedService(e.target.value);
              onOrderDataChange('serviceType', e.target.value);
            }}
            label="Service Type"
            disabled={!orderData.carrier}
          >
            {availableServices.map((service) => (
              <MenuItem key={service} value={service}>
                {service}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={4}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Expected Date"
            value={orderData.expectedDate}
            onChange={(date) => onOrderDataChange('expectedDate', date)}
            sx={{ width: '100%' }}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12} md={4}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Preferred Warehouse</InputLabel>
          <Select
            value={orderData.preferredWarehouse}
            onChange={(e) => {
              setSelectedWarehouseId(e.target.value);
              onOrderDataChange('preferredWarehouse', e.target.value);
            }}
            label="Preferred Warehouse"
          >
            {warehouses.map((warehouse) => (
              <MenuItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default Header_ShippingInfo;