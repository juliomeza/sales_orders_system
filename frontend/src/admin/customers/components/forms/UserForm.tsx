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
    validateEmail
  } = useCustomerUsers({ initialUsers: users, onChange });

  const handleEmailChange = (email: string) => {
    setNewUser(prev => ({
      ...prev,
      email
    }));
  };

  const isEmailValid = newUser.email === '' || validateEmail(newUser.email);

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
          onChange={handleEmailChange}
          error={!isEmailValid}
          helperText={!isEmailValid ? 'Invalid email format' : undefined}
        />
        <Button
          variant="contained"
          onClick={handleAddUser}
          disabled={!validateEmail(newUser.email)}
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