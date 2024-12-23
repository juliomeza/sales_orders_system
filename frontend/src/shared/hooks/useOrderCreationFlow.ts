// frontend/src/shared/hooks/useOrderCreationFlow.ts
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOrderForm } from './useOrderForm';
import { useOrderValidation } from './useOrderValidation';
import { InventoryItem } from '../types/shipping';
import { queryKeys } from '../config/queryKeys';

interface OrderCreationState {
  activeStep: number;
  isSubmitted: boolean;
  showErrors: boolean;
}

export const useOrderCreationFlow = () => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<OrderCreationState>({
    activeStep: 0,
    isSubmitted: false,
    showErrors: false
  });
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);

  const { orderData, handleOrderDataChange, resetForm } = useOrderForm();
  const { errors, canProceedToNextStep, canSubmitOrder } = useOrderValidation(
    orderData,
    selectedItems,
    state.activeStep
  );

  const handleNext = useCallback(() => {
    if (canProceedToNextStep(state.activeStep)) {
      setState(prev => ({
        ...prev,
        activeStep: prev.activeStep + 1,
        showErrors: false
      }));
    } else {
      setState(prev => ({ ...prev, showErrors: true }));
    }
  }, [state.activeStep, canProceedToNextStep]);

  const handleBack = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeStep: prev.activeStep - 1,
      showErrors: false
    }));
  }, []);

  const handleSubmitOrder = useCallback(async () => {
    if (!canSubmitOrder()) {
      setState(prev => ({ ...prev, showErrors: true }));
      return;
    }

    try {
      // Optimistic update
      queryClient.setQueryData(queryKeys.orders.all, (oldData: any) => {
        return oldData ? [...oldData, { ...orderData, status: 'pending' }] : [{ ...orderData, status: 'pending' }];
      });

      await new Promise(resolve => setTimeout(resolve, 1000)); // Replace with actual API call
      
      setState(prev => ({
        ...prev,
        isSubmitted: true,
        activeStep: 3,
        showErrors: false
      }));

      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    } catch (error) {
      console.error('Error submitting order:', error);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    }
  }, [orderData, canSubmitOrder, queryClient]);

  const handleNewOrder = useCallback(() => {
    setState({
      activeStep: 0,
      isSubmitted: false,
      showErrors: false
    });
    resetForm();
    setSelectedItems([]);
  }, [resetForm]);

  return {
    // State
    activeStep: state.activeStep,
    isSubmitted: state.isSubmitted,
    showErrors: state.showErrors,
    selectedItems,
    orderData,
    errors,

    // Actions
    handleOrderDataChange,
    handleNext,
    handleBack,
    handleSubmitOrder,
    handleNewOrder,
    setSelectedItems,
    canProceedToNextStep
  };
};