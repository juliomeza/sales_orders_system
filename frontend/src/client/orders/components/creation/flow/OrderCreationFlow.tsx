/**
 * @fileoverview OrderCreationFlow component handles the multi-step order creation process
 * including order details, item selection, and order review/submission.
 */

import React from 'react';
import { Box } from '@mui/material';
import { useOrderCreationFlow } from '../../../../../shared/hooks/useOrderCreationFlow';
import { StepContent } from './StepContent';
import FixedHeader from '../../FixedHeader';

/**
 * OrderCreationFlow Component
 * 
 * A multi-step form component that manages the order creation process.
 * Uses the useOrderCreationFlow hook for state management and business logic.
 * 
 * @component
 * @returns {JSX.Element} The rendered OrderCreationFlow component
 */
const OrderCreationFlow: React.FC = () => {
  // Destructure all necessary state and handlers from the custom hook
  const {
    activeStep,        // Current active step in the flow
    isSubmitted,       // Flag indicating if the order has been submitted
    selectedItems,     // Array of items selected for the order
    showErrors,        // Flag to control error display
    orderData,         // Object containing order details
    errors,           // Validation errors object
    handleOrderDataChange,  // Handler for updating order data
    handleNext,       // Handler for moving to next step
    handleBack,       // Handler for moving to previous step
    handleSubmitOrder, // Handler for order submission
    handleNewOrder,    // Handler for starting a new order
    setSelectedItems,  // Setter for selected items
    canProceedToNextStep // Function to determine if user can proceed to next step
  } = useOrderCreationFlow();

  // Define the steps in the order creation process
  const steps = ['Order Details', 'Select Items', 'Review & Submit'];

  return (
    <>
      {/* Header component with navigation and action buttons */}
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
      
      {/* Main content area with dynamic step content */}
      <Box sx={{ 
        px: 4, 
        py: 3, 
        bgcolor: 'grey.50',
        minHeight: 'calc(100vh - 240px)',  // Ensures minimum height accounting for header
        marginTop: '180px'                 // Offset for fixed header
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