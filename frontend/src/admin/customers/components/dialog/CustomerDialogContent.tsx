// src/admin/customers/components/dialog/CustomerDialogContent.tsx
import React from 'react';
import { DialogContent, Alert } from '@mui/material';
import BasicInfoForm from '../forms/BasicInfoForm';
import ProjectForm from '../forms/ProjectForm';
import UserForm from '../forms/UserForm';
import { CustomerFormData } from '../../types';

interface CustomerDialogContentProps {
  activeStep: number;
  formData: CustomerFormData;
  showErrors: boolean;
  errors: string[];
  onCustomerChange: (data: Partial<CustomerFormData['customer']>) => void;
  onProjectsChange: (projects: CustomerFormData['projects']) => void;
  onUsersChange: (users: CustomerFormData['users']) => void;
}

export const CustomerDialogContent: React.FC<CustomerDialogContentProps> = ({
  activeStep,
  formData,
  showErrors,
  errors,
  onCustomerChange,
  onProjectsChange,
  onUsersChange
}) => {
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <BasicInfoForm
            data={formData.customer}
            onChange={onCustomerChange}
          />
        );
      case 1:
        return (
          <ProjectForm
            projects={formData.projects}
            onChange={onProjectsChange}
          />
        );
      case 2:
        return (
          <UserForm
            users={formData.users}
            onChange={onUsersChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DialogContent sx={{ py: 3 }}>
      {showErrors && errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
      {getStepContent(activeStep)}
    </DialogContent>
  );
};