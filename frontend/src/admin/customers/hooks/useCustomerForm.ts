// frontend/src/admin/customers/hooks/useCustomerForm.ts
import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Customer, Project, User } from '../../../shared/api/types/customer.types';
import { queryKeys } from '../../../shared/config/queryKeys';

/**
 * Interface for the form's complete state structure
 * @interface CustomerFormState
 * @property {Omit<Customer, 'id' | '_count'>} customer - Basic customer information
 * @property {Project[]} projects - List of customer projects
 * @property {User[]} users - List of customer users
 */
interface CustomerFormState {
  customer: Omit<Customer, 'id' | '_count'>;
  projects: Project[];
  users: User[];
}

/**
 * Interface for validation results
 * @interface ValidationResult
 * @property {boolean} isValid - Whether the validation passed
 * @property {string[]} errors - List of validation error messages
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Props interface for the useCustomerForm hook
 * @interface UseCustomerFormProps
 * @property {Customer} [initialCustomer] - Initial customer data for edit mode
 * @property {(step: number) => void} [onStepComplete] - Callback when a step is completed
 */
interface UseCustomerFormProps {
  initialCustomer?: Customer;
  onStepComplete?: (step: number) => void;
}

/**
 * Initial state template for a new customer
 * Provides default values for all required customer fields
 */
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

/**
 * Custom hook for managing multi-step customer form state and validation
 * Handles form data, validation, and step navigation for customer creation/editing
 */
export const useCustomerForm = ({ 
  initialCustomer,
  onStepComplete 
}: UseCustomerFormProps = {}) => {
  const queryClient = useQueryClient();
  
  // Form state management
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [formData, setFormData] = useState<CustomerFormState>({
    // Initialize form with customer data or defaults
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

  /**
   * Validates basic customer information (Step 1)
   * Checks for required fields and proper formatting
   */
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

  /**
   * Validates project information (Step 2)
   * Checks for required projects, default project, and unique codes
   */
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

  /**
   * Validates user information (Step 3)
   * Checks for required users and unique email addresses
   */
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

  /**
   * Validates the current step's data
   * @param {number} step - Step index to validate
   * @returns {ValidationResult} Validation result with errors if any
   */
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

  /**
   * Form data change handlers
   * Update specific sections of form data while maintaining immutability
   */
  const handleCustomerChange = useCallback((customer: Omit<Customer, 'id' | '_count'>) => {
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

  /**
   * Handles navigation to next step
   * Validates current step before proceeding
   * @returns {boolean} Whether navigation was successful
   */
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

  /**
   * Handles navigation to previous step
   * Resets error display state
   */
  const handleBack = useCallback(() => {
    setActiveStep(prevStep => prevStep - 1);
    setShowErrors(false);
  }, []);

  /**
   * Checks if the entire form can be submitted
   * Validates all steps
   * @returns {boolean} Whether the form is valid for submission
   */
  const canSubmit = useCallback((): boolean => {
    return [0, 1, 2].every(step => validateStep(step).isValid);
  }, [validateStep]);

  /**
   * Resets the form to its initial state
   * Clears all form data and validation states
   */
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

  /**
   * Computed properties for form state and validation
   * Memoized to prevent unnecessary recalculations
   */
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

  // Return hook interface with all necessary state and handlers
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