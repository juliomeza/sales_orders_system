// src/components/orders/OrderCreationFlow.tsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useOrderForm } from '../../hooks/useOrderForm';
import { InventoryItem } from '../../types/shipping';
import OrderHeaderStep from './steps/OrderHeaderStep';
import InventoryStep from './steps/InventoryStep';
import ReviewStep from './steps/ReviewStep';
import FixedHeader from './FixedHeader';

const OrderCreationFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);

  const {
    orderData,
    handleOrderDataChange,
    resetForm
  } = useOrderForm();

  const steps = ['Order Details', 'Select Items', 'Review & Submit'];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmitOrder = async () => {
    try {
      console.log('Submitting order:', {
        orderData,
        items: selectedItems
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      setActiveStep(steps.length);
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };

  const handleNewOrder = () => {
    setActiveStep(0);
    setIsSubmitted(false);
    resetForm();
    setSelectedItems([]);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <OrderHeaderStep 
            orderData={orderData}
            onOrderDataChange={handleOrderDataChange}
          />
        );
      case 1:
        return (
          <InventoryStep
            selectedItems={selectedItems}
            onItemsChange={setSelectedItems}
          />
        );
      case 2:
        return (
          <ReviewStep
            orderData={orderData}
            selectedItems={selectedItems}
            onRemoveItem={(itemId) => {
              setSelectedItems(prev => prev.filter(item => item.id !== itemId));
            }}
            isSubmitted={isSubmitted}
          />
        );
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    switch (activeStep) {
      case 0:
        return !orderData.carrier || !orderData.shipToAccount || !orderData.preferredWarehouse;
      case 1:
        return selectedItems.length === 0;
      default:
        return false;
    }
  };

  return (
    <>
      <FixedHeader 
        activeStep={activeStep}
        isSubmitted={isSubmitted}
        steps={steps}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmitOrder}
        onNewOrder={handleNewOrder}
        isNextDisabled={isNextDisabled}
      />
      
      <Box sx={{ 
        mt: '240px',
        p: 4, 
        bgcolor: '#f8fafc',
        minHeight: 'calc(100vh - 240px)'
      }}>
        {getStepContent(activeStep)}
      </Box>
    </>
  );
};

export default OrderCreationFlow;