// frontend/src/admin/customers/hooks/useCustomerForm.ts
import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Customer, Project, User } from '../../../shared/api/types/customer.types';
import { queryKeys } from '../../../shared/config/queryKeys';

interface CustomerFormState {
  customer: Omit<Customer, 'id' | '_count'>;
  projects: Project[];
  users: User[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface UseCustomerFormProps {
  initialCustomer?: Customer;
  onStepComplete?: (step: number) => void;
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

export const useCustomerForm = ({ 
  initialCustomer,
  onStepComplete 
}: UseCustomerFormProps = {}) => {
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [formData, setFormData] = useState<CustomerFormState>({
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

  const validateBasicInfo = useCallback((): ValidationResult => {
    const errors: string[] = [];
    const { customer } = formData;

    if (!customer.lookupCode) errors.push('Customer Code is required');
    if (!customer.name) errors.push('Customer Name is required');
    if (!customer.address) errors.push('Address is required');
    if (!customer.city) errors.push('City is required');
    if (!customer.state) errors.push('State is required');
    if (!customer.zipCode) errors.push('ZIP Code is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [formData]);

  const validateProjects = useCallback((): ValidationResult => {
    const errors: string[] = [];
    
    if (formData.projects.length === 0) {
      errors.push('At least one project is required');
    }
    
    if (!formData.projects.some(p => p.isDefault)) {
      errors.push('One project must be set as default');
    }

    const duplicateCodes = formData.projects
      .map(p => p.lookupCode)
      .filter((code, index, array) => array.indexOf(code) !== index);

    if (duplicateCodes.length > 0) {
      errors.push('Project codes must be unique');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [formData.projects]);

  const validateUsers = useCallback((): ValidationResult => {
    const errors: string[] = [];
    
    if (formData.users.length === 0) {
      errors.push('At least one user is required');
    }

    const duplicateEmails = formData.users
      .map(u => u.email)
      .filter((email, index, array) => array.indexOf(email) !== index);

    if (duplicateEmails.length > 0) {
      errors.push('Email addresses must be unique');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [formData.users]);

  const validateStep = useCallback((step: number): ValidationResult => {
    switch (step) {
      case 0:
        return validateBasicInfo();
      case 1:
        return validateProjects();
      case 2:
        return validateUsers();
      default:
        return { isValid: true, errors: [] };
    }
  }, [validateBasicInfo, validateProjects, validateUsers]);

  const handleCustomerChange = useCallback((
    customer: Omit<Customer, 'id' | '_count'>
  ) => {
    setFormData(prev => ({ ...prev, customer }));
    setShowErrors(false);
  }, []);

  const handleProjectsChange = useCallback((projects: Project[]) => {
    setFormData(prev => ({ ...prev, projects }));
    setShowErrors(false);
  }, []);

  const handleUsersChange = useCallback((users: User[]) => {
    setFormData(prev => ({ ...prev, users }));
    setShowErrors(false);
  }, []);

  const handleNext = useCallback((): boolean => {
    const validation = validateStep(activeStep);
    if (validation.isValid) {
      onStepComplete?.(activeStep);
      setActiveStep(prevStep => prevStep + 1);
      setShowErrors(false);
      return true;
    } else {
      setShowErrors(true);
      return false;
    }
  }, [activeStep, validateStep, onStepComplete]);

  const handleBack = useCallback(() => {
    setActiveStep(prevStep => prevStep - 1);
    setShowErrors(false);
  }, []);

  const canSubmit = useCallback((): boolean => {
    return [0, 1, 2].every(step => validateStep(step).isValid);
  }, [validateStep]);

  const resetForm = useCallback(() => {
    setFormData({
      customer: initialCustomerState,
      projects: [],
      users: []
    });
    setActiveStep(0);
    setIsSubmitted(false);
    setShowErrors(false);
  }, []);

  // Computed properties
  const currentStepValidation = useMemo(() => 
    validateStep(activeStep),
    [activeStep, validateStep]
  );

  const formState = useMemo(() => ({
    isValid: canSubmit(),
    isDirty: JSON.stringify(formData) !== JSON.stringify({
      customer: initialCustomerState,
      projects: [],
      users: []
    }),
    currentStep: activeStep,
    showErrors,
    validation: currentStepValidation
  }), [formData, activeStep, showErrors, currentStepValidation, canSubmit]);

  return {
    formData,
    formState,
    activeStep,
    showErrors,
    isSubmitted,
    handleCustomerChange,
    handleProjectsChange,
    handleUsersChange,
    handleNext,
    handleBack,
    canSubmit,
    resetForm,
    setIsSubmitted,
    validateStep
  };
};