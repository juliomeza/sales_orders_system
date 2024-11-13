// src/client/components/orders/CarrierServiceSelector.tsx
import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  Box
} from '@mui/material';

interface CarrierService {
  id: number;
  name: string;
  description: string | null;
}

interface CarrierServiceSelectorProps {
  services: CarrierService[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CarrierServiceSelector: React.FC<CarrierServiceSelectorProps> = ({
  services,
  value,
  onChange,
  disabled = false
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth variant="outlined" disabled={disabled}>
      <InputLabel>Service Type</InputLabel>
      <Select
        value={value}
        onChange={handleChange}
        label="Service Type"
      >
        {services.map((service) => (
          <MenuItem key={service.id} value={service.id.toString()}>
            <Box>
              <Typography variant="body1">
                {service.name}
              </Typography>
              {service.description && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {service.description}
                </Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CarrierServiceSelector;