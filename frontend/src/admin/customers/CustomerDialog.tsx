// frontend/src/admin/customers/CustomerDialog.tsx
import React, { useState } from 'react';
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
} from '@mui/material';
import CustomerBasicInfo from './CustomerBasicInfo';
import CustomerProjects from './CustomerProjects';
import CustomerUsers from './CustomerUsers';

interface Customer {
  id?: number;
  lookupCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  status: number;
}

interface Project {
  id?: number;
  lookupCode: string;
  name: string;
  description?: string;
  isDefault: boolean;
}

interface CustomerDialogProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (data: {
    customer: Customer;
    projects: Project[];
    users: any[];
  }) => Promise<void>;
}

const steps = ['Customer Information', 'Projects', 'Users'];

const CustomerDialog: React.FC<CustomerDialogProps> = ({
  open,
  customer,
  onClose,
  onSubmit,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    customer: customer || {
      lookupCode: '',
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      status: 1,
    },
    projects: [] as Project[],
    users: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleStepChange = (type: 'customer' | 'projects' | 'users', data: any) => {
    setFormData(prev => ({
      ...prev,
      [type]: data
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting customer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <CustomerBasicInfo
            data={formData.customer}
            onChange={(data) => handleStepChange('customer', data)}
          />
        );
      case 1:
        return (
          <CustomerProjects
            projects={formData.projects}
            onChange={(data) => handleStepChange('projects', data)}
          />
        );
      case 2:
        return (
          <CustomerUsers
            users={formData.users}
            onChange={(data) => handleStepChange('users', data)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
        <Stepper 
          activeStep={activeStep} 
          sx={{ mb: 4 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2 }}>
          {getStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            variant="outlined"
            disabled={isSubmitting}
          >
            Back
          </Button>
        )}

        {activeStep === steps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Customer'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={isSubmitting}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDialog;