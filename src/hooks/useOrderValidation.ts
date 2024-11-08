// src/hooks/useOrderValidation.ts
import { useState, useEffect } from 'react';
import { OrderData, InventoryItem } from '../types/shipping';

interface ValidationError {
  field: string;
  message: string;
}

interface StepValidation {
  isValid: boolean;
  errors: ValidationError[];
}

export const useOrderValidation = (
  orderData: OrderData,
  selectedItems: InventoryItem[],
  activeStep: number
) => {
  const [stepValidation, setStepValidation] = useState<StepValidation>({
    isValid: false,
    errors: []
  });

  const validateOrderHeader = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Required fields validation
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
        message: 'Service type is required when carrier is selected'
      });
    }

    // Date validation
    if (!orderData.expectedDate) {
      errors.push({
        field: 'expectedDate',
        message: 'Expected delivery date is required'
      });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expectedDate = new Date(orderData.expectedDate);
      expectedDate.setHours(0, 0, 0, 0);

      if (expectedDate < today) {
        errors.push({
          field: 'expectedDate',
          message: 'Expected delivery date cannot be in the past'
        });
      }
    }

    return errors;
  };

  const validateInventory = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (selectedItems.length === 0) {
      errors.push({
        field: 'inventory',
        message: 'At least one item must be selected'
      });
    }

    selectedItems.forEach(item => {
      if (item.quantity <= 0) {
        errors.push({
          field: `quantity_${item.id}`,
          message: `Invalid quantity for item ${item.lookupCode}`
        });
      }
      if (item.quantity > item.available) {
        errors.push({
          field: `quantity_${item.id}`,
          message: `Quantity exceeds available stock for item ${item.lookupCode}`
        });
      }
    });

    return errors;
  };

  const validateReview = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Combine all validations for final review
    return [
      ...validateOrderHeader(),
      ...validateInventory()
    ];
  };

  // Validate current step whenever relevant data changes
  useEffect(() => {
    let errors: ValidationError[] = [];

    switch (activeStep) {
      case 0:
        errors = validateOrderHeader();
        break;
      case 1:
        errors = validateInventory();
        break;
      case 2:
        errors = validateReview();
        break;
      default:
        errors = [];
    }

    setStepValidation({
      isValid: errors.length === 0,
      errors
    });
  }, [activeStep, orderData, selectedItems]);

  const getFieldError = (fieldName: string): string | undefined => {
    const error = stepValidation.errors.find(err => err.field === fieldName);
    return error?.message;
  };

  const canProceedToNextStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return validateOrderHeader().length === 0;
      case 1:
        return validateInventory().length === 0;
      case 2:
        return validateReview().length === 0;
      default:
        return true;
    }
  };

  const canSubmitOrder = (): boolean => {
    return validateReview().length === 0;
  };

  return {
    isStepValid: stepValidation.isValid,
    errors: stepValidation.errors,
    getFieldError,
    canProceedToNextStep,
    canSubmitOrder
  };
};