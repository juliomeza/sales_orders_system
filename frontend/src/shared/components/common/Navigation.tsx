// frontend/src/shared/components/common/Navigation.tsx
import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ExitToApp as LogoutIcon } from '@mui/icons-material';

interface NavigationProps {
  isAdmin?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ isAdmin = false }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const avatarLetter = user?.email.charAt(0).toUpperCase() || '?';
  
  const navItems = isAdmin
    ? [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/users', label: 'Users' },
        { path: '/admin/customers', label: 'Customers' },
        { path: '/admin/materials', label: 'Materials' },
      ]
    : [
        { path: '/', label: 'Orders' },
        { path: '/new-order', label: 'New Order' },
      ];

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to={isAdmin ? '/admin' : '/'}
            sx={{
              mr: 4,
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: 0,
            }}
          >
            {isAdmin ? 'Admin Portal' : 'Order Management'}
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  borderBottom: location.pathname === item.path ? '2px solid white' : 'none',
                  borderRadius: 0,
                  '&:hover': {
                    borderBottom: '2px solid white',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ 
                color: 'white',
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 0.1)' 
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: isAdmin ? 'error.dark' : 'primary.dark',
                  border: '2px solid white'
                }}
              >
                {avatarLetter}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 1,
                  '& .MuiList-root': {
                    p: 1
                  }
                }
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
                onClick={handleLogout}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'error.main',
                  borderRadius: 0.5,
                  '&:hover': {
                    bgcolor: 'error.light',
                  }
                }}
              >
                <LogoutIcon fontSize="small" />
                Log Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;