// frontend/src/client/orders/components/creation/header/ShippingInfo.tsx
import React from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,  // Añadir esta línea
  styled
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { OrderData } from '../../../../../shared/types/shipping';
import { useShipping } from '../../../../../shared/hooks/useShipping';
import CarrierServiceSelector from '../../CarrierServiceSelector';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
  }
}));

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
  }
}));

interface ShippingInfoProps {
  orderData: OrderData;
  onOrderDataChange: (field: keyof OrderData, value: any) => void;
}

const ShippingInfo: React.FC<ShippingInfoProps> = ({
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

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    onOrderDataChange('serviceType', serviceId);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
      <StyledFormControl>
  <InputLabel>Carrier</InputLabel>
  <Select
    value={orderData.carrier}
    onChange={(e) => handleCarrierChange(e.target.value)}
    label="Carrier"
  >
    {carriers.map((carrier) => (
      <MenuItem key={carrier.id} value={carrier.id.toString()}>
        <Box>
          <Typography variant="body1">
            {carrier.lookupCode}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {carrier.name}
          </Typography>
        </Box>
      </MenuItem>
    ))}
  </Select>
</StyledFormControl>
      </Grid>

      <Grid item xs={12} md={4}>
        <CarrierServiceSelector
          services={availableServices}
          value={orderData.serviceType}
          onChange={handleServiceChange}
          disabled={!orderData.carrier}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <StyledDatePicker
            label="Expected Date"
            value={orderData.expectedDate}
            onChange={(date) => onOrderDataChange('expectedDate', date)}
          />
        </LocalizationProvider>
      </Grid>

      <Grid item xs={12} md={4}>
      <StyledFormControl>
        <InputLabel>Preferred Warehouse</InputLabel>
        <Select
          value={orderData.preferredWarehouse}
          onChange={(e) => {
            setSelectedWarehouseId(e.target.value);
            onOrderDataChange('preferredWarehouse', e.target.value);
          }}
          label="Preferred Warehouse"
        >
          {warehouses.map((warehouse) => {
            console.log('Warehouse data:', warehouse); // Añadir este log
            return (
              <MenuItem key={warehouse.id} value={warehouse.id.toString()}>
                <Box>
                  <Typography variant="body1">
                    {`${warehouse.lookupCode} - ${warehouse.city}, ${warehouse.state}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {warehouse.address}
                  </Typography>
                </Box>
              </MenuItem>
            );
          })}
        </Select>
      </StyledFormControl>
      </Grid>
    </Grid>
  );
};

export default ShippingInfo;