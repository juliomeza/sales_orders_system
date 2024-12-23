// src/admin/customers/components/dialog/CustomerDialogContent.tsx
import React from 'react';
import { DialogContent, Alert } from '@mui/material';
import BasicInfoForm from '../forms/BasicInfoForm';
import ProjectForm from '../forms/ProjectForm';
import UserForm from '../forms/UserForm';
import { CustomerFormData } from '../../types';

/**
 * Interface defining the props for the CustomerDialogContent component
 * @interface CustomerDialogContentProps
 * @property {number} activeStep - Current step in the multi-step form (0-2)
 * @property {CustomerFormData} formData - Object containing all form data across steps
 * @property {boolean} showErrors - Flag to control error messages visibility
 * @property {string[]} errors - Array of error messages to display
 * @property {Function} onCustomerChange - Callback to handle basic customer info changes
 * @property {Function} onProjectsChange - Callback to handle projects data changes
 * @property {Function} onUsersChange - Callback to handle users data changes
 */
interface CustomerDialogContentProps {
  activeStep: number;
  formData: CustomerFormData;
  showErrors: boolean;
  errors: string[];
  onCustomerChange: (data: Partial<CustomerFormData['customer']>) => void;
  onProjectsChange: (projects: CustomerFormData['projects']) => void;
  onUsersChange: (users: CustomerFormData['users']) => void;
}

/**
 * Component that renders the content of the Customer Dialog
 * Manages a multi-step form with three steps:
 * 1. Basic Customer Information
 * 2. Project Information
 * 3. User Information
 */
export const CustomerDialogContent: React.FC<CustomerDialogContentProps> = ({
  activeStep,
  formData,
  showErrors,
  errors,
  onCustomerChange,
  onProjectsChange,
  onUsersChange
}) => {
  /**
   * Determines which form component to render based on the current step
   * @param {number} step - Current step index
   * @returns {React.ReactNode} The appropriate form component for the current step
   */
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        // Step 1: Basic customer information form
        return (
          <BasicInfoForm
            data={formData.customer}
            onChange={onCustomerChange}
          />
        );
      case 1:
        // Step 2: Project configuration form
        return (
          <ProjectForm
            projects={formData.projects}
            onChange={onProjectsChange}
          />
        );
      case 2:
        // Step 3: User management form
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
      {/* Error message section - displays validation errors when present */}
      {showErrors && errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      {/* Render the current step's form content */}
      {getStepContent(activeStep)}
    </DialogContent>
  );
};