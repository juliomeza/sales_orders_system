// frontend/src/client/orders/components/FixedHeader.tsx
import React from 'react';
import { Box, Stepper, Step, StepLabel, Button } from '@mui/material';
import { InventoryItem } from '../../../shared/types/shipping';
import ReviewTotals from '../../../client/orders/components/review/ReviewTotals';

interface FixedHeaderProps {
  activeStep: number;
  isSubmitted: boolean;
  steps: string[];
  selectedItems?: InventoryItem[];
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onNewOrder: () => void;
  isNextDisabled: () => boolean;
}

const FixedHeader: React.FC<FixedHeaderProps> = ({
  activeStep,
  isSubmitted,
  steps,
  selectedItems = [],
  onBack,
  onNext,
  onSubmit,
  onNewOrder,
  isNextDisabled
}) => {
  // Modifica los pasos basado en el estado de envío
  const displaySteps = steps.map((step, index) => 
    index === steps.length - 1 && isSubmitted ? 'Submitted' : step
  );

  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
        position: 'fixed',
        top: '64px',
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar
      })}
    >
      <Box
        sx={(theme) => ({
          padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
          backgroundColor: theme.palette.background.paper,
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(2)
        })}>
        <Stepper 
          activeStep={isSubmitted ? steps.length : activeStep}
          sx={{ 
            '& .MuiStepLabel-root .Mui-completed': {
              color: 'success.main',
            },
            '& .MuiStepLabel-root .Mui-active': {
              color: 'primary.main',
            },
          }}
        >
          {displaySteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 2,
            borderTop: 1,
            borderColor: 'divider',
            pt: 2
          }}>
          {activeStep === 2 && !isSubmitted && (
            <Box sx={{ display: 'flex', gap: 2, mr: 'auto' }}>
              <ReviewTotals
                selectedItems={selectedItems}
                compact={true}
              />
            </Box>
          )}

          {!isSubmitted && activeStep > 0 && (
            <Button 
              onClick={onBack}
              variant="outlined"
              sx={(theme) => ({
                borderColor: 'grey.300',
                color: 'grey.700',
                borderRadius: theme.shape.borderRadius,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'grey.400',
                  bgcolor: 'grey.50',
                },
              })}
            >
              Back
            </Button>
          )}
          
          {isSubmitted ? (
            <Button
              variant="contained"
              onClick={onNewOrder}
              sx={(theme) => ({
                borderRadius: theme.shape.borderRadius,
                textTransform: 'none',
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              })}
            >
              New Order
            </Button>
          ) : activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={onSubmit}
              sx={(theme) => ({
                borderRadius: theme.shape.borderRadius,
                textTransform: 'none',
                bgcolor: 'success.main',
                '&:hover': {
                  bgcolor: 'success.dark',
                },
              })}
            >
              Submit Order
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={onNext}
              disabled={isNextDisabled()}
              sx={(theme) => ({
                borderRadius: theme.shape.borderRadius,
                textTransform: 'none',
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              })}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default FixedHeader;