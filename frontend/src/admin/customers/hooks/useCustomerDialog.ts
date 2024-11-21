// src/admin/customers/hooks/useCustomerDialog.ts
import { useState } from 'react';
import { Customer } from '../types';

export const useCustomerDialog = (
  customer: Customer | null,
  onClose: () => void,
  onSubmit: (data: any) => Promise<void>
) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [formData, setFormData] = useState(() => ({
    customer: customer ? {
      lookupCode: customer.lookupCode,
      name: customer.name,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      phone: customer.phone || '',
      email: customer.email || '',
      status: customer.status
    } : {
      lookupCode: '',
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      status: 1
    },
    projects: customer?.projects || [],
    users: customer?.users || []
  }));

  const validateStep = (step: number): string[] => {
    const errors: string[] = [];
    switch (step) {
      case 0:
        if (!formData.customer.lookupCode) errors.push('Customer Code is required');
        if (!formData.customer.name) errors.push('Customer Name is required');
        if (!formData.customer.address) errors.push('Address is required');
        if (!formData.customer.city) errors.push('City is required');
        if (!formData.customer.state) errors.push('State is required');
        if (!formData.customer.zipCode) errors.push('ZIP Code is required');
        break;
      case 1:
        if (formData.projects.length === 0) {
          errors.push('At least one project is required');
        }
        if (!formData.projects.some(p => p.isDefault)) {
          errors.push('One project must be set as default');
        }
        break;
      case 2:
        if (formData.users.length === 0) {
          errors.push('At least one user is required');
        }
        break;
    }
    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(activeStep);
    if (errors.length === 0) {
      setActiveStep(prev => prev + 1);
      setShowErrors(false);
      return true;
    }
    setShowErrors(true);
    return false;
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setShowErrors(false);
  };

  const handleClose = () => {
    setActiveStep(0);
    setShowErrors(false);
    onClose();
  };

  const handleSubmit = async () => {
    let hasErrors = false;
    for (let step = 0; step <= 2; step++) {
      const errors = validateStep(step);
      if (errors.length > 0) {
        hasErrors = true;
        break;
      }
    }

    if (!hasErrors) {
      await onSubmit(formData);
      handleClose();
    } else {
      setShowErrors(true);
    }
  };

  const handleCustomerChange = (customerData: any) => {
    setFormData(prev => ({ ...prev, customer: customerData }));
  };

  const handleProjectsChange = (projects: any[]) => {
    setFormData(prev => ({ ...prev, projects }));
  };

  const handleUsersChange = (users: any[]) => {
    setFormData(prev => ({ ...prev, users }));
  };

  return {
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
  };
};