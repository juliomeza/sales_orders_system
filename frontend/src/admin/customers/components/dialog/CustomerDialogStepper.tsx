// src/admin/customers/components/dialog/CustomerDialogStepper.tsx
import React from 'react';
import { Stepper, Step, StepLabel } from '@mui/material';

const steps = ['Basic Information', 'Projects', 'Users'];

interface CustomerDialogStepperProps {
  activeStep: number;
}

export const CustomerDialogStepper: React.FC<CustomerDialogStepperProps> = ({ activeStep }) => (
  <Stepper activeStep={activeStep} sx={{ py: 3, px: 2 }}>
    {steps.map((label) => (
      <Step key={label}>
        <StepLabel>{label}</StepLabel>
      </Step>
    ))}
  </Stepper>
);