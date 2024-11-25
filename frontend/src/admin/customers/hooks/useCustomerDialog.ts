// src/admin/customers/hooks/useCustomerDialog.ts
import { useState, useEffect } from 'react';
import { Customer, CustomerFormData, CreateCustomerData } from '../types';

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

export const useCustomerDialog = (
  customer: Customer | null,
  onClose: () => void,
  onSubmit: (data: CreateCustomerData) => Promise<void>,
  onUpdate?: (customerId: number, data: Partial<CreateCustomerData>) => Promise<void>
) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>(() => 
    customer ? {
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
      projects: customer.projects?.map(project => ({
        id: project.id,
        lookupCode: project.lookupCode || '', // Aseguramos valor por defecto
        name: project.name || '',             // Aseguramos valor por defecto
        description: project.description || '', // Aseguramos valor por defecto
        isDefault: Boolean(project.isDefault)  // Convertimos a booleano
      })) || [],
      users: customer.users?.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role || 'CLIENT',
        status: user.status
      })) || []
    } : initialFormState
  );

  // Effect to update form data when customer changes
  useEffect(() => {
    if (customer) {
      console.log('Customer in dialog:', customer);
      console.log('Customer users:', customer.users);
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
        projects: (customer.projects || []).map(project => {
          return {
            id: project.id,
            lookupCode: project.lookupCode || '',  // Aseguramos valor por defecto
            name: project.name || '',              // Aseguramos valor por defecto
            description: project.description || '', // Aseguramos valor por defecto
            isDefault: Boolean(project.isDefault)   // Convertimos a booleano
          };
        }),
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
    setFormData(initialFormState);
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

  const handleSaveStep = async () => {
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
            customer: formData.customer, // Mantener los datos del cliente
            projects: formData.projects.map(project => ({
              lookupCode: project.lookupCode || '',
              name: project.name || '',
              description: project.description || '',
              isDefault: Boolean(project.isDefault)
            })).filter(p => p.lookupCode && p.name) // Solo proyectos con datos válidos
          };
          break;
        case 2:
          dataToUpdate = {
            users: formData.users
          };
          break;
      }

      await onUpdate(customer.id, dataToUpdate);
      setShowErrors(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      setShowErrors(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCustomerChange = (customerData: Partial<CustomerFormData['customer']>) => {
    setFormData(prev => ({
      ...prev,
      customer: { ...prev.customer, ...customerData }
    }));
  };

  const handleProjectsChange = (projects: CustomerFormData['projects']) => {
    const updatedProjects = projects.map(project => ({
      ...project,
      lookupCode: project.lookupCode || '',  // Aseguramos valor por defecto
      name: project.name || '',              // Aseguramos valor por defecto
      description: project.description || '', // Aseguramos valor por defecto
      isDefault: Boolean(project.isDefault)   // Convertimos a booleano
    }));
    setFormData(prev => ({ ...prev, projects: updatedProjects }));
  };

  const handleUsersChange = (users: CustomerFormData['users']) => {
    setFormData(prev => ({ ...prev, users }));
  };

  return {
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
    isEditMode: !!customer
  };
};