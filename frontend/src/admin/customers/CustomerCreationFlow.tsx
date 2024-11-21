// frontend/src/admin/customers/CustomerCreationFlow.tsx
import React, { useState } from 'react';
import { Box, Card, Stepper, Step, StepLabel, Button } from '@mui/material';
import CustomerBasicInfo from './CustomerBasicInfo';
import CustomerProjects from './CustomerProjects';
import CustomerUsers from './CustomerUsers';
import { useCustomers } from './useCustomers';
import { Customer, Project, User } from './types';

const initialCustomerState: Omit<Customer, 'id' | '_count'> = {
  lookupCode: '',
  name: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  email: '',
  status: 1
};

const steps = ['Basic Information', 'Projects', 'Users'];

const CustomerCreationFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    customer: initialCustomerState,
    projects: [] as Project[],
    users: [] as User[]
  });
  const [errors, setErrors] = useState<string[]>([]);
  const { handleCreateCustomer } = useCustomers();

  const validateBasicInfo = (): boolean => {
    const { customer } = formData;
    const newErrors: string[] = [];

    if (!customer.lookupCode) newErrors.push('Customer Code is required');
    if (!customer.name) newErrors.push('Customer Name is required');
    if (!customer.address) newErrors.push('Address is required');
    if (!customer.city) newErrors.push('City is required');
    if (!customer.state) newErrors.push('State is required');
    if (!customer.zipCode) newErrors.push('ZIP Code is required');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const validateProjects = (): boolean => {
    const newErrors: string[] = [];
    
    if (formData.projects.length === 0) {
      newErrors.push('At least one project is required');
    }
    
    const hasDefault = formData.projects.some(p => p.isDefault);
    if (!hasDefault && formData.projects.length > 0) {
      newErrors.push('One project must be set as default');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const validateUsers = (): boolean => {
    const newErrors: string[] = [];
    
    if (formData.users.length === 0) {
      newErrors.push('At least one user is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    switch (activeStep) {
      case 0:
        isValid = validateBasicInfo();
        break;
      case 1:
        isValid = validateProjects();
        break;
      case 2:
        isValid = validateUsers();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
      setErrors([]);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setErrors([]);
  };

  const handleSubmit = async () => {
    if (validateUsers()) {
      try {
        await handleCreateCustomer(formData);
        // Reset form or redirect
      } catch (error) {
        setErrors(['Error creating customer. Please try again.']);
      }
    }
  };

  const handleCustomerChange = (customer: Omit<Customer, 'id' | '_count'>) => {
    setFormData(prev => ({ ...prev, customer }));
  };

  const handleProjectsChange = (projects: Project[]) => {
    setFormData(prev => ({ ...prev, projects }));
  };

  const handleUsersChange = (users: User[]) => {
    setFormData(prev => ({ ...prev, users }));
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

  return (
    <Box>
      <Card sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {errors.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {errors.map((error, index) => (
              <div key={index} style={{ color: 'red' }}>{error}</div>
            ))}
          </Box>
        )}

        <Box sx={{ mt: 2, mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack} variant="outlined">
              Back
            </Button>
          )}
          
          {activeStep === steps.length - 1 ? (
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Create Customer
            </Button>
          ) : (
            <Button onClick={handleNext} variant="contained" color="primary">
              Next
            </Button>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default CustomerCreationFlow;