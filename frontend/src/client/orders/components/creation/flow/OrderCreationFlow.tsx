// frontend/src/client/orders/components/creation/flow/OrderCreationFlow.tsx
import React from 'react';
import { Box } from '@mui/material';
import { useOrderCreationFlow } from '../../../../../shared/hooks/useOrderCreationFlow';
import { StepContent } from './StepContent';
import FixedHeader from '../../FixedHeader';

const OrderCreationFlow: React.FC = () => {
  const {
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
  } = useOrderCreationFlow();

  const steps = ['Order Details', 'Select Items', 'Review & Submit'];

  return (
    <>
      <FixedHeader 
        activeStep={activeStep}
        isSubmitted={isSubmitted}
        steps={steps}
        selectedItems={selectedItems}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmitOrder}
        onNewOrder={handleNewOrder}
        isNextDisabled={() => !canProceedToNextStep(activeStep)}
      />
      
      <Box sx={{ 
        px: 4, 
        py: 3, 
        bgcolor: 'grey.50',
        minHeight: 'calc(100vh - 240px)',
        marginTop: '180px'
      }}>
        <StepContent
          step={activeStep}
          orderData={orderData}
          selectedItems={selectedItems}
          showErrors={showErrors}
          errors={errors}
          handleOrderDataChange={handleOrderDataChange}
          setSelectedItems={setSelectedItems}
          isSubmitted={isSubmitted}
        />
      </Box>
    </>
  );
};

export default OrderCreationFlow;