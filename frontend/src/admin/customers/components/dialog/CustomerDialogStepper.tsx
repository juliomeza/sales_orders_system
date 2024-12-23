// src/admin/customers/components/dialog/CustomerDialogStepper.tsx
import React from 'react';
import { Stepper, Step, StepLabel } from '@mui/material';

/**
 * Array of step labels for the customer creation/editing process
 * Each string represents a distinct step in the workflow
 */
const steps = ['Basic Information', 'Projects', 'Users'];

/**
 * Interface for the CustomerDialogStepper component props
 * @interface CustomerDialogStepperProps
 * @property {number} activeStep - Current active step index (0-2)
 */
interface CustomerDialogStepperProps {
  activeStep: number;
}

/**
 * Component that renders the stepper navigation for the customer dialog
 * Shows the progress through the three main steps of customer creation/editing:
 * 1. Basic Information - Customer details and settings
 * 2. Projects - Project configuration and assignment
 * 3. Users - User management and permissions
 */
export const CustomerDialogStepper: React.FC<CustomerDialogStepperProps> = ({ activeStep }) => (
  <Stepper 
    activeStep={activeStep} 
    sx={{ py: 3, px: 2 }}
  >
    {/* Map through step labels to create individual step indicators */}
    {steps.map((label) => (
      <Step key={label}>
        <StepLabel>{label}</StepLabel>
      </Step>
    ))}
  </Stepper>
);