// frontend/src/admin/customers/CustomerDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Alert,
} from '@mui/material';
import CustomerBasicInfo from './CustomerBasicInfo';
import CustomerProjects from './CustomerProjects';
import CustomerUsers from './CustomerUsers';
import { useCustomerForm } from './useCustomerForm';
import { Customer } from './types';

interface CustomerDialogProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const steps = ['Basic Information', 'Projects', 'Users'];

const CustomerDialog: React.FC<CustomerDialogProps> = ({
  open,
  customer,
  onClose,
  onSubmit
}) => {
  const {
    formData,
    activeStep,
    showErrors,
    handleCustomerChange,
    handleProjectsChange,
    handleUsersChange,
    handleNext,
    handleBack,
    validateStep,
    canSubmit,
    resetForm
  } = useCustomerForm(customer || undefined);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (canSubmit()) {
      await onSubmit(formData);
      handleClose();
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <CustomerBasicInfo
            data={formData.customer}
            onChange={handleCustomerChange}
          />
        );
      case 1:
        return (
          <CustomerProjects
            projects={formData.projects}
            onChange={handleProjectsChange}
          />
        );
      case 2:
        return (
          <CustomerUsers
            users={formData.users}
            onChange={handleUsersChange}
          />
        );
      default:
        return null;
    }
  };

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

      <DialogContent sx={{ py: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {showErrors && errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          {getStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
        >
          Cancel
        </Button>

        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
        )}

        {activeStep === steps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!canSubmit()}
          >
            {customer ? 'Save Changes' : 'Create Customer'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            variant="contained"
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDialog;