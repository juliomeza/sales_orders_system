// src/admin/customers/components/dialog/CustomerDialog.tsx
import React from 'react';
import { Dialog, DialogTitle } from '@mui/material';
import { CustomerDialogStepper } from './CustomerDialogStepper';
import { CustomerDialogContent } from './CustomerDialogContent';
import { CustomerDialogActions } from './CustomerDialogActions';
import { useCustomerDialog } from '../../hooks/useCustomerDialog';
import { Customer, CustomerFormData, CreateCustomerData } from '../../types';

interface CustomerDialogProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (data: CreateCustomerData) => Promise<void>;
  onUpdate?: (customerId: number, data: Partial<CreateCustomerData>) => Promise<void>;
}

export const CustomerDialog: React.FC<CustomerDialogProps> = ({
  open,
  customer,
  onClose,
  onSubmit,
  onUpdate
}) => {
  const {
    activeStep,
    formData,
    showErrors,
    isSaving,
    handleNext,
    handleBack,
    handleClose,
    handleSubmit,
    handleSaveStep,
    handleCustomerChange,
    handleProjectsChange,
    handleUsersChange,
    validateStep,
    isEditMode
  } = useCustomerDialog({
    customer,
    onClose,
    onSubmit,
    onUpdate
  });

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
        {isEditMode ? 'Edit Customer' : 'Create New Customer'}
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
        isEditMode={isEditMode}
        isSaving={isSaving}
        onBack={handleBack}
        onNext={handleNext}
        onClose={handleClose}
        onSubmit={handleSubmit}
        onSaveStep={isEditMode ? handleSaveStep : undefined}
      />
    </Dialog>
  );
};