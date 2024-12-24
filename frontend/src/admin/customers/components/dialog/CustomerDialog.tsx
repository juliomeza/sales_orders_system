// frontend/src/admin/customers/components/dialog/CustomerDialog.tsx
import React from 'react';
import { Dialog, DialogTitle } from '@mui/material';
import { CustomerDialogStepper } from './CustomerDialogStepper';
import { CustomerDialogContent } from './CustomerDialogContent';
import { CustomerDialogActions } from './CustomerDialogActions';
import { useCustomerDialog } from '../../hooks/useCustomerDialog';
import { Customer, CustomerFormData, CreateCustomerData } from '../../types';

/**
 * Props for the CustomerDialog component
 * @interface CustomerDialogProps
 * @property {boolean} open - Controls the visibility of the dialog
 * @property {Customer | null} customer - Customer data for editing mode, null for creation mode
 * @property {() => void} onClose - Callback function when dialog is closed
 * @property {(data: CreateCustomerData) => Promise<void>} onSubmit - Callback for form submission
 * @property {(customerId: number, data: Partial<CreateCustomerData>) => Promise<void>} [onUpdate] - Optional callback for updating existing customer
 */
interface CustomerDialogProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (data: CreateCustomerData) => Promise<void>;
  onUpdate?: (customerId: number, data: Partial<CreateCustomerData>) => Promise<void>;
}

/**
 * CustomerDialog Component
 * 
 * A multi-step dialog for creating or editing customer information.
 * Handles both creation and editing modes with a stepper interface.
 * 
 * Features:
 * - Multi-step form with validation
 * - Customer details, projects, and users management
 * - Progressive save in edit mode
 * - Responsive design
 * 
 * @component
 * @example
 * ```tsx
 * <CustomerDialog
 *   open={isOpen}
 *   customer={selectedCustomer}
 *   onClose={handleClose}
 *   onSubmit={handleSubmit}
 *   onUpdate={handleUpdate}
 * />
 * ```
 */
export const CustomerDialog: React.FC<CustomerDialogProps> = ({
  open,
  customer,
  onClose,
  onSubmit,
  onUpdate
}) => {
  // Custom hook que maneja toda la lógica del formulario
  const {
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
    isEditMode
  } = useCustomerDialog({
    customer,
    onClose,
    onSubmit,
    onUpdate
  });

  // Validación del paso actual
  const errors = validateStep(activeStep);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' } // Altura mínima para mejor UX
      }}
    >
      {/* Encabezado del diálogo con modo condicional */}
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        py: 2
      }}>
        {isEditMode ? 'Edit Customer' : 'Create New Customer'}
      </DialogTitle>

      {/* Stepper que muestra el progreso del formulario */}
      <CustomerDialogStepper activeStep={activeStep} />
      
      {/* Contenido del paso actual del formulario */}
      {/* Paso 1: Detalles del cliente */}
      {/* Paso 2: Gestión de proyectos */}
      {/* Paso 3: Gestión de usuarios */}
      <CustomerDialogContent 
        activeStep={activeStep}
        formData={formData}
        showErrors={showErrors}
        errors={errors}
        onCustomerChange={handleCustomerChange}
        onProjectsChange={handleProjectsChange}
        onUsersChange={handleUsersChange}
      />
      
      {/* Botones de acción (Back, Next, Save, etc.) */}
      <CustomerDialogActions
        activeStep={activeStep}
        isEditMode={isEditMode}
        isSaving={isSaving}
        onBack={handleBack}
        onNext={handleNext}
        onClose={handleClose}
        onSubmit={handleSubmit}
        onSaveStep={isEditMode ? handleSaveStep : undefined}
      />
    </Dialog>
  );
};