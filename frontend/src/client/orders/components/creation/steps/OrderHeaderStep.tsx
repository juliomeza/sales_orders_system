// frontend/src/client/orders/components/creation/steps/OrderHeaderStep.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Box,
} from '@mui/material';
import { OrderData } from '../../../../../shared/types/shipping';
import BasicInfo from '../header/BasicInfo';
import ShippingInfo from '../header/ShippingInfo';
import AddressSection from '../header/AddressSection';

interface OrderHeaderStepProps {
  orderData: OrderData;
  onOrderDataChange: (field: keyof OrderData, value: any) => void;
}

const OrderHeaderStep: React.FC<OrderHeaderStepProps> = ({
  orderData,
  onOrderDataChange,
}) => {
  return (
    <Card sx={{ 
      bgcolor: '#fff', 
      borderRadius: 1, 
      boxShadow: 1 
    }}>
      <CardContent>
        <form 
          autoComplete="off" 
          onSubmit={(e) => e.preventDefault()} 
          data-form-type="other"
        >
          <BasicInfo 
            orderData={orderData}
            onOrderDataChange={onOrderDataChange}
          />
          
          <Box sx={{ mt: 3 }}>
            <ShippingInfo 
              orderData={orderData}
              onOrderDataChange={onOrderDataChange}
            />
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <AddressSection 
              orderData={orderData}
              onOrderDataChange={onOrderDataChange}
            />
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderHeaderStep;