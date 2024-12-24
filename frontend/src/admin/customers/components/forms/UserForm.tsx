// frontend/src/admin/customers/components/forms/UserForm.tsx
import React from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Divider
} from '@mui/material';
import { UserFormInputs } from '../form-fields/UserFormInputs';
import { UsersTable } from '../tables/UsersTable';
import { ResetPasswordDialog } from '../dialog/ResetPasswordDialog';
import { useCustomerUsers } from '../../hooks/useCustomerUsers';
import { User } from '../../types';

interface UserFormProps {
  users: User[];
  onChange: (users: User[]) => void;
}

const UserForm: React.FC<UserFormProps> = ({
  users,
  onChange
}) => {
  console.log('Users data in UserForm:', users);
  
  const {
    newUser,
    resetPasswordUser,
    handleAddUser,
    handleRemoveUser,
    openResetPassword,
    closeResetPassword,
    handleResetPassword,
    setNewUser,
    getFieldError
  } = useCustomerUsers({ initialUsers: users, onChange });

  const errors = getFieldError();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Users
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Add or modify users that will have access to this customer's portal
      </Alert>

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Add New User
      </Typography>

      <Box sx={{ mb: 3 }}>
        <UserFormInputs
          email={newUser.email}
          password={newUser.password}
          confirmPassword={newUser.confirmPassword}
          onChange={(field, value) => setNewUser(prev => ({ ...prev, [field]: value }))}
          error={errors}
        />
        <Button
          variant="contained"
          onClick={handleAddUser}
          disabled={Object.keys(errors).length > 0 || !newUser.email}
          sx={{ mt: 2 }}
        >
          Add User
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Existing Users
      </Typography>

      <UsersTable
        users={users.map(user => ({
          ...user,
          email: user.email || '',
          role: user.role || 'CLIENT',
          status: user.status || 1
        }))}
        onDelete={handleRemoveUser}
        onResetPassword={openResetPassword}
      />

      {resetPasswordUser && (
        <ResetPasswordDialog
          open={true}
          userEmail={resetPasswordUser.email}
          onClose={closeResetPassword}
          onConfirm={handleResetPassword}
        />
      )}
    </Box>
  );
};

export default UserForm;