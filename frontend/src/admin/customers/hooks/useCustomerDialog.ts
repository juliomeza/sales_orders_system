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

interface UseCustomerDialogProps {
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (data: CreateCustomerData) => Promise<void>;
  onUpdate?: (customerId: number, data: Partial<CreateCustomerData>) => Promise<void>;
}

export const useCustomerDialog = ({
  customer,
  onClose,
  onSubmit,
  onUpdate
}: UseCustomerDialogProps) => {
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>(initialFormState);

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

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
    setShowErrors(false);
  }, []);

  const handleClose = useCallback(() => {
    setActiveStep(0);
    setShowErrors(false);
    setFormData(initialFormState);
    onClose();
  }, [onClose]);

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