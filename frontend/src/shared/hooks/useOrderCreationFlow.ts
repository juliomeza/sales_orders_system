// frontend/src/shared/hooks/useOrderCreationFlow.ts
import { useState } from 'react';
import { useOrderForm } from './useOrderForm';
import { useOrderValidation } from './useOrderValidation';
import { InventoryItem } from '../types/shipping';

export const useOrderCreationFlow = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  const { orderData, handleOrderDataChange, resetForm } = useOrderForm();
  const { errors, canProceedToNextStep, canSubmitOrder } = useOrderValidation(
    orderData,
    selectedItems,
    activeStep
  );

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      setActiveStep(3); // Number of steps
      setShowErrors(false);
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };

  const handleNewOrder = () => {
    setActiveStep(0);
    setIsSubmitted(false);
    resetForm();
    setSelectedItems([]);
    setShowErrors(false);
  };

  return {
    activeStep,
    isSubmitted,
    selectedItems,
    showErrors,
    orderData,
    errors,
    handleOrderDataChange,
    handleNext,
    handleBack,
    handleSubmitOrder,
    handleNewOrder,
    setSelectedItems,
    canProceedToNextStep
  };
};