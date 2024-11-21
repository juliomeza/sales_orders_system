// src/admin/customers/components/dialog/CustomerDialogContent.tsx
import React from 'react';
import { DialogContent, Alert } from '@mui/material';
import CustomerBasicInfo from '../forms/CustomerBasicInfo';
import CustomerProjects from '../forms/CustomerProjects';
import CustomerUsers from '../forms/CustomerUsers';

interface CustomerDialogContentProps {
  activeStep: number;
  formData: any;
  showErrors: boolean;
  errors: string[];
  onCustomerChange: (data: any) => void;
  onProjectsChange: (data: any[]) => void;
  onUsersChange: (data: any[]) => void;
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
          <CustomerBasicInfo
            data={formData.customer}
            onChange={onCustomerChange}
          />
        );
      case 1:
        return (
          <CustomerProjects
            projects={formData.projects}
            onChange={onProjectsChange}
          />
        );
      case 2:
        return (
          <CustomerUsers
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