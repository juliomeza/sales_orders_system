// frontend/src/shared/hooks/useOrderCreationFlow.ts
/**
 * @fileoverview Custom hook for managing the order creation workflow
 * Handles multi-step form state, validation, and order submission process
 * with optimistic updates and error handling.
 */

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOrderForm } from './useOrderForm';
import { useOrderValidation } from './useOrderValidation';
import { InventoryItem } from '../types/shipping';
import { queryKeys } from '../config/queryKeys';

/**
 * Interface for managing the state of the order creation flow
 */
interface OrderCreationState {
  activeStep: number;    // Current step in the workflow
  isSubmitted: boolean;  // Whether the order has been submitted
  showErrors: boolean;   // Whether to display validation errors
}

/**
 * Hook for managing the entire order creation process
 * 
 * @returns {Object} Order creation state and handlers
 */
export const useOrderCreationFlow = () => {
  const queryClient = useQueryClient();
  
  // Initialize state for workflow management
  const [state, setState] = useState<OrderCreationState>({
    activeStep: 0,
    isSubmitted: false,
    showErrors: false
  });
  
  // State for selected inventory items
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);

  // Import form management and validation hooks
  const { orderData, handleOrderDataChange, resetForm } = useOrderForm();
  const { errors, canProceedToNextStep, canSubmitOrder } = useOrderValidation(
    orderData,
    selectedItems,
    state.activeStep
  );

  /**
   * Handles progression to next step
   * Validates current step before proceeding
   */
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

  /**
   * Handles navigation to previous step
   * Resets error display when moving back
   */
  const handleBack = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeStep: prev.activeStep - 1,
      showErrors: false
    }));
  }, []);

  /**
   * Handles order submission
   * Includes optimistic updates and error handling
   */
  const handleSubmitOrder = useCallback(async () => {
    if (!canSubmitOrder()) {
      setState(prev => ({ ...prev, showErrors: true }));
      return;
    }

    try {
      // Optimistic update to orders list
      queryClient.setQueryData(queryKeys.orders.all, (oldData: any) => {
        return oldData ? [...oldData, { ...orderData, status: 'pending' }] : [{ ...orderData, status: 'pending' }];
      });

      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update UI state on success
      setState(prev => ({
        ...prev,
        isSubmitted: true,
        activeStep: 3,
        showErrors: false
      }));

      // Refresh affected data
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    } catch (error) {
      console.error('Error submitting order:', error);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    }
  }, [orderData, canSubmitOrder, queryClient]);

  /**
   * Resets the entire form to start a new order
   * Clears all state and form data
   */
  const handleNewOrder = useCallback(() => {
    setState({
      activeStep: 0,
      isSubmitted: false,
      showErrors: false
    });
    resetForm();
    setSelectedItems([]);
  }, [resetForm]);

  // Return state and handlers
  return {
    // Current state
    activeStep: state.activeStep,
    isSubmitted: state.isSubmitted,
    showErrors: state.showErrors,
    selectedItems,
    orderData,
    errors,

    // Action handlers
    handleOrderDataChange,
    handleNext,
    handleBack,
    handleSubmitOrder,
    handleNewOrder,
    setSelectedItems,
    canProceedToNextStep
  };
};