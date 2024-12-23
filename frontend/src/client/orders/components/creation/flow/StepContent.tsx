/**
 * @fileoverview StepContent component that manages the different steps in the order creation flow
 * and renders the appropriate component based on the current step.
 */

import React from 'react';
import { OrderData, InventoryItem } from '../../../../../shared/types/shipping';
import OrderHeaderStep from '../steps/OrderHeaderStep';
import InventoryStep from '../steps/InventoryStep';
import ReviewStep from '../steps/ReviewStep';
import { ValidationError } from '../../../../../shared/hooks/useOrderValidation';
import ValidationErrors from '../../../../../shared/components/common/ValidationErrors';

/**
 * Interface defining the props required by the StepContent component
 * @interface
 */
interface StepContentProps {
  step: number;                   // Current active step index
  orderData: OrderData;           // Order details and information
  selectedItems: InventoryItem[]; // Items selected for the order
  showErrors: boolean;            // Flag to control error display
  errors: ValidationError[];      // Array of validation errors
  handleOrderDataChange: (field: keyof OrderData, value: any) => void; // Handler for updating order data
  setSelectedItems: (items: InventoryItem[] | ((prev: InventoryItem[]) => InventoryItem[])) => void; // Handler for updating selected items
  isSubmitted: boolean;           // Flag indicating if order is submitted
}

/**
 * StepContent Component
 * 
 * Renders different components based on the current step in the order creation flow:
 * - Step 0: Order Header (basic order information)
 * - Step 1: Inventory Selection (item selection)
 * - Step 2: Order Review (final review and submission)
 * 
 * Each step includes validation error display and specific functionality
 * 
 * @component
 * @param {StepContentProps} props - Component props
 * @returns {JSX.Element | null} The rendered step content or null if invalid step
 */
export const StepContent: React.FC<StepContentProps> = ({
  step,
  orderData,
  selectedItems,
  showErrors,
  errors,
  handleOrderDataChange,
  setSelectedItems,
  isSubmitted
}) => {
  switch (step) {
    // Step 0: Order Details Entry
    case 0:
      return (
        <>
          {/* Display validation errors if any */}
          <ValidationErrors errors={errors} show={showErrors} />
          {/* Render order header form */}
          <OrderHeaderStep 
            orderData={orderData}
            onOrderDataChange={handleOrderDataChange}
          />
        </>
      );

    // Step 1: Item Selection
    case 1:
      return (
        <>
          <ValidationErrors errors={errors} show={showErrors} />
          {/* Render inventory selection interface */}
          <InventoryStep
            selectedItems={selectedItems}
            onItemsChange={setSelectedItems}
          />
        </>
      );

    // Step 2: Order Review and Submission
    case 2:
      return (
        <>
          <ValidationErrors errors={errors} show={showErrors} />
          {/* Render order review interface */}
          <ReviewStep
            orderData={orderData}
            selectedItems={selectedItems}
            onRemoveItem={(itemId: string) => {
              // Handler to remove items from the selection
              setSelectedItems((prev: InventoryItem[]) => 
                prev.filter((item: InventoryItem) => item.id !== itemId)
              );
            }}
            isSubmitted={isSubmitted}
          />
        </>
      );

    // Return null for invalid steps
    default:
      return null;
  }
};