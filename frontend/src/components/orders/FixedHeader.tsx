// src/components/orders/FixedHeader.tsx
import React from 'react';
import { Box, Typography, Stepper, Step, StepLabel, Button } from '@mui/material';

interface FixedHeaderProps {
  activeStep: number;
  isSubmitted: boolean;
  steps: string[];
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
  onBack,
  onNext,
  onSubmit,
  onNewOrder,
  isNextDisabled
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        bgcolor: '#fff',
        borderBottom: '1px solid',
        borderColor: 'grey.200',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Box 
        sx={{ 
          p: 3, 
          bgcolor: 'primary.main'
        }}
      >
        <Typography variant="h5" sx={{ color: 'white' }}>New Order</Typography>
      </Box>
      
      <Box sx={{ 
        px: 4, 
        py: 2, 
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
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
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2,
          borderTop: '1px solid',
          borderColor: 'grey.200',
          pt: 2
        }}>
          {!isSubmitted && activeStep > 0 && (
            <Button 
              onClick={onBack}
              variant="outlined"
              sx={{
                borderColor: 'grey.300',
                color: 'grey.700',
                '&:hover': {
                  borderColor: 'grey.400',
                  bgcolor: 'grey.50',
                },
              }}
            >
              Back
            </Button>
          )}
          
          {isSubmitted ? (
            <Button
              variant="contained"
              onClick={onNewOrder}
              sx={{
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              New Order
            </Button>
          ) : activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={onSubmit}
              sx={{
                bgcolor: 'success.main',
                '&:hover': {
                  bgcolor: 'success.dark',
                },
              }}
            >
              Submit Order
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={onNext}
              disabled={isNextDisabled()}
              sx={{
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
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