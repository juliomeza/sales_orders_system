// src/components/orders/OrderCreationFlow.tsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useOrderForm } from '../../hooks/useOrderForm';
import { useOrderValidation } from '../../hooks/useOrderValidation';
import { InventoryItem } from '../../types/shipping';
import OrderHeaderStep from './steps/OrderHeaderStep';
import InventoryStep from './steps/InventoryStep';
import ReviewStep from './steps/ReviewStep';
import FixedHeader from './FixedHeader';
import ValidationErrors from '../validation/ValidationErrors';

const OrderCreationFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  const {
    orderData,
    handleOrderDataChange,
    resetForm
  } = useOrderForm();

  const {
    errors,
    canProceedToNextStep,
    canSubmitOrder
  } = useOrderValidation(orderData, selectedItems, activeStep);

  const steps = ['Order Details', 'Select Items', 'Review & Submit'];

  const handleNext = () => {
    if (canProceedToNextStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      setShowErrors(false);
    } else {
      setShowErrors(true);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setShowErrors(false);
  };

  const handleSubmitOrder = async () => {
    if (!canSubmitOrder()) {
      setShowErrors(true);
      return;
    }

    try {
      console.log('Submitting order:', {
        orderData,
        items: selectedItems
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      setActiveStep(steps.length);
      setShowErrors(false);
    } catch (error) {
      console.error('Error submitting order:', error);
      // Aquí podrías mostrar un error específico de envío
    }
  };

  const handleNewOrder = () => {
    setActiveStep(0);
    setIsSubmitted(false);
    resetForm();
    setSelectedItems([]);
    setShowErrors(false);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <ValidationErrors errors={errors} show={showErrors} />
            <OrderHeaderStep 
              orderData={orderData}
              onOrderDataChange={handleOrderDataChange}
            />
          </>
        );
      case 1:
        return (
          <>
            <ValidationErrors errors={errors} show={showErrors} />
            <InventoryStep
              selectedItems={selectedItems}
              onItemsChange={setSelectedItems}
            />
          </>
        );
      case 2:
        return (
          <>
            <ValidationErrors errors={errors} show={showErrors} />
            <ReviewStep
              orderData={orderData}
              selectedItems={selectedItems}
              onRemoveItem={(itemId) => {
                setSelectedItems(prev => prev.filter(item => item.id !== itemId));
              }}
              isSubmitted={isSubmitted}
            />
          </>
        );
      default:
        return null;
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
        isNextDisabled={() => !canProceedToNextStep(activeStep)}
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