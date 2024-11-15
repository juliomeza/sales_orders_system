// frontend/src/shared/components/navigation/UserMenu.tsx
import React from 'react';
import { Menu, MenuItem, Typography, Box, Divider } from '@mui/material';
import { ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../../auth/contexts/AuthContext';

interface UserMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onLogout: () => void;
  isAdmin: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  anchorEl,
  onClose,
  onLogout,
  isAdmin
}) => {
  const { user } = useAuth();
  
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        elevation: 3,
        sx: (theme) => ({
          mt: 1,
          minWidth: 200,
          borderRadius: theme.shape.borderRadius,
          '& .MuiList-root': { p: 1 }
        })
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Signed in as
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {user?.email}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: isAdmin ? 'error.main' : 'primary.main',
            fontWeight: 500,
            display: 'block',
            mt: 0.5
          }}
        >
          {isAdmin ? 'Administrator' : 'Client User'}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <MenuItem 
        onClick={onLogout}
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: 'error.main',
          borderRadius: theme.shape.borderRadius,
          '&:hover': {
            bgcolor: 'error.light',
            color: 'error.dark',
          }
        })}
      >
        <LogoutIcon fontSize="small" />
        Log Out
      </MenuItem>
    </Menu>
  );
};