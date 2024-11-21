// frontend/src/admin/customers/CustomerUsers.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

interface User {
  email: string;
  role: string;
  status: number;
}

interface CustomerUsersProps {
  users: User[];
  onChange: (users: User[]) => void;
}

const CustomerUsers: React.FC<CustomerUsersProps> = ({
  users,
  onChange
}) => {
  const [newUser, setNewUser] = useState<User>({
    email: '',
    role: 'CLIENT',
    status: 1
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddUser = () => {
    if (!validateEmail(newUser.email)) return;
    
    onChange([...users, newUser]);
    setNewUser({
      email: '',
      role: 'CLIENT',
      status: 1
    });
  };

  const handleRemoveUser = (index: number) => {
    const updatedUsers = users.filter((_, i) => i !== index);
    onChange(updatedUsers);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Users
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Add users that will have access to this customer's portal
      </Alert>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Email"
          type="email"
          value={newUser.email}
          onChange={(e) => setNewUser(prev => ({
            ...prev,
            email: e.target.value
          }))}
          error={newUser.email !== '' && !validateEmail(newUser.email)}
          helperText={newUser.email !== '' && !validateEmail(newUser.email) ? 'Invalid email' : ''}
          size="small"
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleAddUser}
          disabled={!validateEmail(newUser.email)}
        >
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.email}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status === 1 ? 'Active' : 'Inactive'}
                    color={user.status === 1 ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleRemoveUser(index)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No users added
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CustomerUsers;