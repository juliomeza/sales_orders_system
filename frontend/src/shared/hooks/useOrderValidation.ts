// frontend/src/shared/hooks/useOrderValidation.ts
/**
 * @fileoverview Custom hook for order validation
 * Provides comprehensive validation for multi-step order creation process
 * with specific validation rules for each step.
 */

import { useState, useEffect } from 'react';
import { OrderData, InventoryItem } from '../types/shipping';

/**
 * Represents a single validation error
 */
export interface ValidationError {
  field: string;    // Field that failed validation
  message: string;  // User-friendly error message
}

/**
 * Internal state structure for step validation
 */
interface StepValidation {
  isValid: boolean;         // Whether current step is valid
  errors: ValidationError[]; // List of validation errors
}

/**
 * Hook for managing order validation across multiple steps
 * 
 * @param {OrderData} orderData - Current order data
 * @param {InventoryItem[]} selectedItems - Selected inventory items
 * @param {number} activeStep - Current step in the order process
 * @returns {Object} Validation state and utility functions
 */
export const useOrderValidation = (
  orderData: OrderData,
  selectedItems: InventoryItem[],
  activeStep: number
) => {
  // Initialize validation state
  const [stepValidation, setStepValidation] = useState<StepValidation>({
    isValid: false,
    errors: []
  });

  // Track selected item IDs for validation
  const itemIds = selectedItems.map(item => item.id);

  /**
   * Validates order header information (Step 1)
   * Checks required fields and date validity
   * 
   * @returns {ValidationError[]} Array of validation errors
   */
  const validateOrderHeader = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Required field validations
    if (!orderData.shipToAccount) {
      errors.push({
        field: 'shipToAccount',
        message: 'Shipping account is required'
      });
    }

    if (!orderData.carrier) {
      errors.push({
        field: 'carrier',
        message: 'Carrier is required' 
      });
    }

    if (!orderData.preferredWarehouse) {
      errors.push({
        field: 'preferredWarehouse',
        message: 'Preferred warehouse is required'
      });
    }

    if (orderData.carrier && !orderData.serviceType) {
      errors.push({
        field: 'serviceType',
        message: 'Service type is required'
      });
    }

    // Date validation
    if (orderData.expectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expectedDate = new Date(orderData.expectedDate);
      expectedDate.setHours(0, 0, 0, 0);

      if (expectedDate < today) {
        errors.push({
          field: 'expectedDate',
          message: 'Expected date cannot be in the past'
        });
      }
    }

    return errors;
  };

  /**
   * Validates inventory selections (Step 2)
   * Checks item selection and quantity constraints
   * 
   * @returns {ValidationError[]} Array of validation errors
   */
  const validateInventory = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Check if any items are selected
    if (selectedItems.length === 0) {
      errors.push({
        field: 'inventory',
        message: 'At least one item must be selected'
      });
      return errors;
    }

    // Validate quantities for each item
    selectedItems.forEach(item => {
      if (item.quantity <= 0) {
        errors.push({
          field: `quantity_${item.id}`,
          message: `Invalid quantity for ${item.lookupCode}`
        });
      }

      if (item.quantity > item.available) {
        errors.push({
          field: `quantity_${item.id}`,
          message: `Quantity exceeds available stock (${item.available}) for ${item.lookupCode}`
        });
      }
    });

    return errors;
  };

  /**
   * Updates validation state when dependencies change
   * Runs appropriate validations based on current step
   */
  useEffect(() => {
    let errors: ValidationError[] = [];

    // Determine which validations to run based on active step
    switch (activeStep) {
      case 0:
        errors = validateOrderHeader();
        break;
      case 1: 
        errors = validateInventory();
        break;
      case 2:
        errors = [...validateOrderHeader(), ...validateInventory()];
        break;
    }

    setStepValidation({
      isValid: errors.length === 0,
      errors
    });
  }, [activeStep, orderData, selectedItems]);

  // Return validation interface
  return {
    isStepValid: stepValidation.isValid,
    errors: stepValidation.errors,
    getFieldError: (fieldName: string) => 
      stepValidation.errors.find(err => err.field === fieldName)?.message,
    canProceedToNextStep: (step: number) => {
      switch (step) {
        case 0: return validateOrderHeader().length === 0;
        case 1: return validateInventory().length === 0;
        case 2: return [...validateOrderHeader(), ...validateInventory()].length === 0;
        default: return true;
      }
    },
    canSubmitOrder: () => [...validateOrderHeader(), ...validateInventory()].length === 0
  };
};