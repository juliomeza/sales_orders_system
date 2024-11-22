// src/admin/customers/components/forms/UserForm.tsx
import React from 'react';
import {
  Box,
  Button,
  Typography,
  Alert
} from '@mui/material';
import { UserFormInputs } from '../form-fields/UserFormInputs';
import { UsersTable } from '../tables/UsersTable';
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
  const {
    newUser,
    handleAddUser,
    handleRemoveUser,
    setNewUser,
    getFieldError
  } = useCustomerUsers({ initialUsers: users, onChange });

  const errors = getFieldError();

  const handleFieldChange = (field: 'email' | 'password' | 'confirmPassword', value: string) => {
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Users
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Add users that will have access to this customer's portal
      </Alert>

      <Box sx={{ mb: 3 }}>
        <UserFormInputs
          email={newUser.email}
          password={newUser.password}
          confirmPassword={newUser.confirmPassword}
          onChange={handleFieldChange}
          error={errors}
        />
        <Button
          variant="contained"
          onClick={handleAddUser}
          disabled={Object.keys(errors).length > 0}
          sx={{ mt: 2 }}
        >
          Add User
        </Button>
      </Box>

      <UsersTable
        users={users}
        onDelete={handleRemoveUser}
      />
    </Box>
  );
};

export default UserForm;