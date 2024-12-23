// frontend/src/admin/customers/hooks/useCustomerDialog.ts
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Customer, 
  Project,
  User,
  CreateCustomerData 
} from '../../../shared/api/types/customer.types';
import { queryKeys } from '../../../shared/config/queryKeys';

/**
 * Interface defining the structure of the customer form data
 * Contains all information needed across the three form steps
 */
interface CustomerFormData {
  customer: {
    lookupCode: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
    status: number;
  };
  projects: Project[];
  users: User[];
}

/**
 * Initial state for the customer form
 * Provides default values for all form fields
 */
const initialFormState: CustomerFormData = {
  customer: {
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
  projects: [],
  users: []
};

/**
 * Props interface for the useCustomerDialog hook
 * @interface UseCustomerDialogProps
 * @property {Customer | null} customer - Existing customer data for edit mode
 * @property {() => void} onClose - Callback when dialog is closed
 * @property {(data: CreateCustomerData) => Promise<void>} onSubmit - Callback for creating new customer
 * @property {(customerId: number, data: Partial<CreateCustomerData>) => Promise<void>} onUpdate - Optional callback for updating existing customer
 */
interface UseCustomerDialogProps {
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (data: CreateCustomerData) => Promise<void>;
  onUpdate?: (customerId: number, data: Partial<CreateCustomerData>) => Promise<void>;
}

/**
 * Custom hook for managing the customer dialog state and operations
 * Handles form state, validation, and API interactions across multiple steps
 */
export const useCustomerDialog = ({
  customer,
  onClose,
  onSubmit,
  onUpdate
}: UseCustomerDialogProps) => {
  const queryClient = useQueryClient();
  // State management for form steps and validation
  const [activeStep, setActiveStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>(initialFormState);

  /**
   * Effect to initialize form data when customer data is provided
   * Maps customer data to form structure for editing
   */
  useEffect(() => {
    if (customer) {
      setFormData({
        customer: {
          lookupCode: customer.lookupCode,
          name: customer.name,
          address: customer.address,
          city: customer.city,
          state: customer.state,
          zipCode: customer.zipCode,
          phone: customer.phone || '',
          email: customer.email || '',
          status: customer.status
        },
        projects: (customer.projects || []).map(project => ({
          id: project.id,
          lookupCode: project.lookupCode || '',
          name: project.name || '',
          description: project.description || '',
          isDefault: Boolean(project.isDefault)
        })),
        users: customer.users?.map(user => ({
          id: user.id,
          email: user.email,
          role: user.role || 'CLIENT',
          status: user.status
        })) || []
      });
    } else {
      setFormData(initialFormState);
    }
  }, [customer]);

  /**
   * Validates the current step's data
   * @param {number} step - Step index to validate
   * @returns {string[]} Array of validation error messages
   */
  const validateStep = useCallback((step: number): string[] => {
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
        if (!formData.projects.some((p: Project) => p.isDefault)) {
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
  }, [formData]);

  /**
   * Handles navigation to next step
   * Validates current step before proceeding
   * @returns {boolean} Whether navigation was successful
   */
  const handleNext = useCallback(() => {
    const errors = validateStep(activeStep);
    if (errors.length === 0) {
      setActiveStep(prev => prev + 1);
      setShowErrors(false);
      return true;
    }
    setShowErrors(true);
    return false;
  }, [activeStep, validateStep]);

  /**
   * Handles navigation to previous step
   * Resets error display state
   */
  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
    setShowErrors(false);
  }, []);

  /**
   * Handles dialog closure
   * Resets form state and triggers onClose callback
   */
  const handleClose = useCallback(() => {
    setActiveStep(0);
    setShowErrors(false);
    setFormData(initialFormState);
    onClose();
  }, [onClose]);

  /**
   * Handles form submission for new customer creation
   * Validates all steps before submission
   */
  const handleSubmit = useCallback(async () => {
    const allErrors = [0, 1, 2].flatMap(step => validateStep(step));
    if (allErrors.length > 0) {
      setShowErrors(true);
      return;
    }

    try {
      await onSubmit(formData);
      await queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setShowErrors(true);
    }
  }, [formData, validateStep, onSubmit, queryClient, handleClose]);

  /**
   * Handles saving changes for the current step in edit mode
   * Validates current step and updates specific sections based on step
   */
  const handleSaveStep = useCallback(async () => {
    if (!customer?.id || !onUpdate) return;

    const errors = validateStep(activeStep);
    if (errors.length > 0) {
      setShowErrors(true);
      return;
    }

    setIsSaving(true);
    try {
      let dataToUpdate: Partial<CreateCustomerData> = {};

      switch (activeStep) {
        case 0:
          dataToUpdate = {
            customer: formData.customer
          };
          break;
        case 1:
          dataToUpdate = {
            customer: formData.customer,
            projects: formData.projects.map((project: Project) => ({
              lookupCode: project.lookupCode || '',
              name: project.name || '',
              description: project.description || '',
              isDefault: Boolean(project.isDefault)
            }))
          };
          break;
        case 2:
          dataToUpdate = {
            customer: formData.customer,
            users: formData.users.map((user: User) => ({
              email: user.email,
              role: user.role || 'CLIENT',
              status: user.status || 1,
              password: user.password
            }))
          };
          break;
      }

      await onUpdate(customer.id, dataToUpdate);
      await queryClient.invalidateQueries({ queryKey: queryKeys.customers.byId(customer.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      setShowErrors(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      setShowErrors(true);
    } finally {
      setIsSaving(false);
    }
  }, [activeStep, customer, formData, onUpdate, queryClient, validateStep]);

  /**
   * Form field change handlers
   * Update specific sections of form data while maintaining immutability
   */
  const handleCustomerChange = useCallback((
    customerData: Partial<CustomerFormData['customer']>
  ) => {
    setFormData((prev: CustomerFormData) => ({
      ...prev,
      customer: { ...prev.customer, ...customerData }
    }));
  }, []);

  const handleProjectsChange = useCallback((
    projects: Project[]
  ) => {
    setFormData((prev: CustomerFormData) => ({
      ...prev,
      projects: projects.map((project: Project) => ({
        ...project,
        lookupCode: project.lookupCode || '',
        name: project.name || '',
        description: project.description || '',
        isDefault: Boolean(project.isDefault)
      }))
    }));
  }, []);

  const handleUsersChange = useCallback((
    users: User[]
  ) => {
    setFormData((prev: CustomerFormData) => ({ ...prev, users }));
  }, []);

  // Return hook interface with all necessary state and handlers
  return {
    activeStep,
    formData,
    showErrors,
    isSaving,
    isEditMode: Boolean(customer),
    handleNext,
    handleBack,
    handleClose,
    handleSubmit,
    handleSaveStep,
    handleCustomerChange,
    handleProjectsChange,
    handleUsersChange,
    validateStep
  };
};