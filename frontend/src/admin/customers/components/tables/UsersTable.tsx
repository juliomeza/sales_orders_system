// src/admin/customers/components/tables/UsersTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Tooltip
} from '@mui/material';
import { Delete as DeleteIcon, Key as KeyIcon } from '@mui/icons-material';
import { User } from '../../types';

interface UsersTableProps {
  users: User[];
  onDelete: (index: number) => void;
  onResetPassword: (index: number) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onDelete,
  onResetPassword
}) => {
  return (
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
          {users && users.length > 0 ? (
            users.map((user, index) => (
              <TableRow key={user.id || user.email}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role || 'CLIENT'}
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
                  <Tooltip title="Reset Password">
                    <IconButton
                      onClick={() => onResetPassword(index)}
                      size="small"
                      color="primary"
                    >
                      <KeyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User">
                    <IconButton
                      onClick={() => onDelete(index)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography variant="body2" color="text.secondary">
                  No users added
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};