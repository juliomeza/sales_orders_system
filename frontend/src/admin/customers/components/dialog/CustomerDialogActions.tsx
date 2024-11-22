// src/admin/customers/components/dialog/CustomerDialogActions.tsx
import React from 'react';
import { DialogActions, Button, Stack, Box } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

interface CustomerDialogActionsProps {
  activeStep: number;
  isEditMode: boolean;
  isSaving?: boolean;
  onBack: () => void;
  onNext: () => void;
  onClose: () => void;
  onSubmit: () => void;
  onSaveStep?: () => void;
}

export const CustomerDialogActions: React.FC<CustomerDialogActionsProps> = ({
  activeStep,
  isEditMode,
  isSaving = false,
  onBack,
  onNext,
  onClose,
  onSubmit,
  onSaveStep
}) => {
  return (
    <DialogActions 
      sx={{ 
        px: 3, 
        py: 2,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 2
      }}
    >
      {/* Left-aligned cancel button */}
      <Box sx={{ justifySelf: 'start' }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
        >
          Cancel
        </Button>
      </Box>

      {/* Center-aligned navigation buttons */}
      <Stack direction="row" spacing={2} sx={{ justifySelf: 'center' }}>
        {activeStep > 0 && (
          <Button
            onClick={onBack}
            variant="outlined"
            startIcon={<NavigateBeforeIcon />}
          >
            Back
          </Button>
        )}
        {activeStep < 2 && (
          <Button
            onClick={onNext}
            variant="outlined"
            endIcon={<NavigateNextIcon />}
          >
            Next
          </Button>
        )}
      </Stack>

      {/* Right-aligned action buttons (Save/Create) */}
      <Box sx={{ justifySelf: 'end' }}>
        {isEditMode && onSaveStep ? (
          <Button
            onClick={onSaveStep}
            variant="contained"
            color="success"
            disabled={isSaving}
            startIcon={<SaveIcon />}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        ) : (!isEditMode && activeStep === 2) && (
          <Button 
            onClick={onSubmit}
            variant="contained"
            color="primary"
          >
            Create Customer
          </Button>
        )}
      </Box>
    </DialogActions>
  );
};