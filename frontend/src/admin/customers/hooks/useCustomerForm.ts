// frontend/src/admin/customers/hooks/useCustomerForm.ts
import { useState } from 'react';
import { Customer, Project, User } from '../types';

interface CustomerFormData {
  customer: Omit<Customer, 'id' | '_count'>;
  projects: Project[];
  users: User[];
}

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

export const useCustomerForm = (initialCustomer?: Customer) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    customer: initialCustomer ? {
      lookupCode: initialCustomer.lookupCode,
      name: initialCustomer.name,
      address: initialCustomer.address,
      city: initialCustomer.city,
      state: initialCustomer.state,
      zipCode: initialCustomer.zipCode,
      phone: initialCustomer.phone || '',
      email: initialCustomer.email || '',
      status: initialCustomer.status
    } : initialCustomerState,
    projects: initialCustomer?.projects || [],
    users: initialCustomer?.users || []
  });

  const validateBasicInfo = (): string[] => {
    const errors: string[] = [];
    const { customer } = formData;

    if (!customer.lookupCode) errors.push('Customer Code is required');
    if (!customer.name) errors.push('Customer Name is required');
    if (!customer.address) errors.push('Address is required');
    if (!customer.city) errors.push('City is required');
    if (!customer.state) errors.push('State is required');
    if (!customer.zipCode) errors.push('ZIP Code is required');

    return errors;
  };

  const validateProjects = (): string[] => {
    const errors: string[] = [];
    
    if (formData.projects.length === 0) {
      errors.push('At least one project is required');
    }
    
    const hasDefault = formData.projects.some(p => p.isDefault);
    if (!hasDefault && formData.projects.length > 0) {
      errors.push('One project must be set as default');
    }

    return errors;
  };

  const validateUsers = (): string[] => {
    const errors: string[] = [];
    
    if (formData.users.length === 0) {
      errors.push('At least one user is required');
    }

    return errors;
  };

  const validateStep = (step: number): string[] => {
    switch (step) {
      case 0:
        return validateBasicInfo();
      case 1:
        return validateProjects();
      case 2:
        return validateUsers();
      default:
        return [];
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

  const handleNext = (): boolean => {
    const errors = validateStep(activeStep);
    if (errors.length === 0) {
      setActiveStep((prevStep) => prevStep + 1);
      setShowErrors(false);
      return true;
    } else {
      setShowErrors(true);
      return false;
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setShowErrors(false);
  };

  const canSubmit = (): boolean => {
    return validateBasicInfo().length === 0 
      && validateProjects().length === 0 
      && validateUsers().length === 0;
  };

  const resetForm = () => {
    setFormData({
      customer: initialCustomerState,
      projects: [],
      users: []
    });
    setActiveStep(0);
    setIsSubmitted(false);
    setShowErrors(false);
  };

  return {
    formData,
    activeStep,
    showErrors,
    isSubmitted,
    validateStep,
    handleCustomerChange,
    handleProjectsChange,
    handleUsersChange,
    handleNext,
    handleBack,
    canSubmit,
    resetForm,
    setIsSubmitted
  };
};