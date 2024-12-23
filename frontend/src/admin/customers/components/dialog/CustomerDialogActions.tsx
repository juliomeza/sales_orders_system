// src/admin/customers/components/dialog/CustomerDialogActions.tsx
import React from 'react';
import { DialogActions, Button, Stack, Box } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

/**
 * Interface defining the props for the CustomerDialogActions component
 * @interface CustomerDialogActionsProps
 * @property {number} activeStep - Current step in the multi-step form (0-2)
 * @property {boolean} isEditMode - Whether the dialog is in edit mode
 * @property {boolean} isSaving - Optional flag indicating if a save operation is in progress
 * @property {() => void} onBack - Callback function to handle going back one step
 * @property {() => void} onNext - Callback function to handle advancing to next step
 * @property {() => void} onClose - Callback function to handle dialog closure
 * @property {() => void} onSubmit - Callback function to handle form submission
 * @property {() => void} onSaveStep - Optional callback function to handle saving current step
 */
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

/**
 * Component that renders the action buttons for the Customer Dialog
 * This includes navigation buttons (Back/Next), Cancel button, and Save/Create buttons
 * Layout is organized in a three-column grid:
 * - Left: Cancel button
 * - Center: Navigation buttons (Back/Next)
 * - Right: Action buttons (Save/Create)
 */
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
        gridTemplateColumns: '1fr auto 1fr', // Three-column layout
        gap: 2
      }}
    >
      {/* Left column: Cancel button to exit the dialog */}
      <Box sx={{ justifySelf: 'start' }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
        >
          Cancel
        </Button>
      </Box>

      {/* Center column: Step navigation buttons */}
      <Stack direction="row" spacing={2} sx={{ justifySelf: 'center' }}>
        {/* Show Back button if not on first step */}
        {activeStep > 0 && (
          <Button
            onClick={onBack}
            variant="outlined"
            startIcon={<NavigateBeforeIcon />}
          >
            Back
          </Button>
        )}
        {/* Show Next button if not on last step */}
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

      {/* Right column: Context-aware action buttons */}
      <Box sx={{ justifySelf: 'end' }}>
        {/* Show Save Changes button in edit mode when onSaveStep is available */}
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
        ) : (
          /* Show Create Customer button only on last step in create mode */
          !isEditMode && activeStep === 2 && (
            <Button 
              onClick={onSubmit}
              variant="contained"
              color="primary"
            >
              Create Customer
            </Button>
          )
        )}
      </Box>
    </DialogActions>
  );
};