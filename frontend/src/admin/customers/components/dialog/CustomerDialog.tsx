// src/admin/customers/components/dialog/CustomerDialog.tsx
import React from 'react';
import { Dialog, DialogTitle } from '@mui/material';
import { CustomerDialogStepper } from './CustomerDialogStepper';
import { CustomerDialogContent } from './CustomerDialogContent';
import { CustomerDialogActions } from './CustomerDialogActions';
import { useCustomerDialog } from '../../hooks/useCustomerDialog';
import { Customer } from '../../types';

interface CustomerDialogProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const CustomerDialog: React.FC<CustomerDialogProps> = ({
  open,
  customer,
  onClose,
  onSubmit
}) => {
  const {
    activeStep,
    formData,
    showErrors,
    handleNext,
    handleBack,
    handleClose,
    handleSubmit,
    handleCustomerChange,
    handleProjectsChange,
    handleUsersChange,
    validateStep
  } = useCustomerDialog(customer, onClose, onSubmit);

  const errors = validateStep(activeStep);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        py: 2
      }}>
        {customer ? 'Edit Customer' : 'Create New Customer'}
      </DialogTitle>

      <CustomerDialogStepper activeStep={activeStep} />
      
      <CustomerDialogContent 
        activeStep={activeStep}
        formData={formData}
        showErrors={showErrors}
        errors={errors}
        onCustomerChange={handleCustomerChange}
        onProjectsChange={handleProjectsChange}
        onUsersChange={handleUsersChange}
      />
      
      <CustomerDialogActions
        activeStep={activeStep}
        isEditMode={!!customer}
        onBack={handleBack}
        onNext={handleNext}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </Dialog>
  );
};

export default CustomerDialog;