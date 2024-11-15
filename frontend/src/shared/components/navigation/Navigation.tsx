// frontend/src/shared/components/navigation/Navigation.tsx
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, IconButton, Avatar, Box, Button } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { UserMenu } from './UserMenu';

interface NavigationProps {
  isAdmin?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ isAdmin = false }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
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

  const avatarLetter = user?.email.charAt(0).toUpperCase() || '?';

  return (
    <AppBar position="fixed" sx={{ mb: 3, zIndex: (theme) => theme.zIndex.appBar + 1 }}>
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
                onClick={() => navigate(item.path)}
                sx={(theme) => ({
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: theme.shape.borderRadius,
                  borderBottom: location.pathname === item.path ? '2px solid white' : '2px solid transparent',
                  '&:hover': {
                    borderBottom: '2px solid white',
                  },
                })}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <IconButton
            onClick={handleMenuOpen}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: isAdmin ? 'error.dark' : 'primary.dark',
                border: (theme) => `2px solid ${theme.palette.common.white}`
              }}
            >
              {avatarLetter}
            </Avatar>
          </IconButton>

          <UserMenu
            anchorEl={anchorEl}
            onClose={handleMenuClose}
            onLogout={handleLogout}
            isAdmin={isAdmin}
          />
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;