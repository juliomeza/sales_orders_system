// frontend/src/client/orders/components/creation/flow/StepContent.tsx
import React from 'react';
import { OrderData, InventoryItem } from '../../../../../shared/types/shipping';
import OrderHeaderStep from '../steps/OrderHeaderStep';
import InventoryStep from '../steps/InventoryStep';
import ReviewStep from '../steps/ReviewStep';
import { ValidationError } from '../../../../../shared/hooks/useOrderValidation';
import ValidationErrors from '../../../../../shared/components/common/ValidationErrors';

interface StepContentProps {
  step: number;
  orderData: OrderData;
  selectedItems: InventoryItem[];
  showErrors: boolean;
  errors: ValidationError[];
  handleOrderDataChange: (field: keyof OrderData, value: any) => void;
  setSelectedItems: (items: InventoryItem[] | ((prev: InventoryItem[]) => InventoryItem[])) => void;
  isSubmitted: boolean;
}

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
            onRemoveItem={(itemId: string) => {
              setSelectedItems((prev: InventoryItem[]) => 
                prev.filter((item: InventoryItem) => item.id !== itemId)
              );
            }}
            isSubmitted={isSubmitted}
          />
        </>
      );
    default:
      return null;
  }
};