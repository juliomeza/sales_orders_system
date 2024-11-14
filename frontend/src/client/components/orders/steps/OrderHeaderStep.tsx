// src/components/orders/steps/OrderHeaderStep.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Box,
} from '@mui/material';
import { OrderData } from '../../../../shared/types/shipping';
import Header_BasicInfo from '../header/HeaderBasicInfo';
import Header_ShippingInfo from '../header/HeaderShippingInfo';
import Header_AddressSection from '../header/HeaderAddressSection';

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
        <Header_BasicInfo 
          orderData={orderData}
          onOrderDataChange={onOrderDataChange}
        />
        
        <Box sx={{ mt: 3 }}>
          <Header_ShippingInfo 
            orderData={orderData}
            onOrderDataChange={onOrderDataChange}
          />
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Header_AddressSection 
            orderData={orderData}
            onOrderDataChange={onOrderDataChange}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderHeaderStep;