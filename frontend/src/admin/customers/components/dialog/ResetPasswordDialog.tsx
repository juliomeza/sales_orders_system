// frontend/src/admin/customers/components/dialog/ResetPasswordDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box
} from '@mui/material';

/**
 * Interface for the ResetPasswordDialog component props
 * @interface ResetPasswordDialogProps
 * @property {boolean} open - Controls the visibility of the dialog
 * @property {string} userEmail - Email of the user whose password is being reset
 * @property {() => void} onClose - Callback function when dialog is closed
 * @property {(password: string) => void} onConfirm - Callback function when password reset is confirmed
 */
interface ResetPasswordDialogProps {
  open: boolean;
  userEmail: string;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

/**
 * Component that displays a dialog for resetting a user's password
 * Includes password validation and confirmation functionality
 */
export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  open,
  userEmail,
  onClose,
  onConfirm
}) => {
  // State management for form fields and validation
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  /**
   * Handles the password reset submission
   * Validates password requirements and matching confirmation
   */
  const handleSubmit = () => {
    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    onConfirm(password);
    handleClose();
  };

  /**
   * Resets the dialog state and closes it
   * Clears all form fields and error messages
   */
  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {/* Dialog title showing the user's email */}
      <DialogTitle>Reset Password for {userEmail}</DialogTitle>

      <DialogContent>
        {/* Error message display area */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Password input form */}
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* New password input field */}
          <TextField
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          {/* Password confirmation field */}
          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>

      {/* Dialog action buttons */}
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!password || !confirmPassword}
        >
          Reset Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};