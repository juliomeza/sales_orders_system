// src/admin/customers/components/dialog/CustomerDialogActions.tsx
import React from 'react';
import { DialogActions, Button } from '@mui/material';

interface CustomerDialogActionsProps {
  activeStep: number;
  isEditMode: boolean;
  onBack: () => void;
  onNext: () => void;
  onClose: () => void;
  onSubmit: () => void;
}

export const CustomerDialogActions: React.FC<CustomerDialogActionsProps> = ({
  activeStep,
  isEditMode,
  onBack,
  onNext,
  onClose,
  onSubmit
}) => (
  <DialogActions sx={{ px: 3, py: 2, gap: 2 }}>
    <Button onClick={onClose} variant="outlined">
      Cancel
    </Button>

    {activeStep > 0 && (
      <Button onClick={onBack} variant="outlined">
        Back
      </Button>
    )}

    {activeStep === 2 ? (
      <Button onClick={onSubmit} variant="contained">
        {isEditMode ? 'Save Changes' : 'Create Customer'}
      </Button>
    ) : (
      <Button onClick={onNext} variant="contained">
        Next
      </Button>
    )}
  </DialogActions>
);