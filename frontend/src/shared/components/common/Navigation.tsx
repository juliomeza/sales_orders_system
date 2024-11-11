import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  isAdmin?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ isAdmin = false }) => {
  const location = useLocation();
  
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

          <Button
            component={Link}
            to={isAdmin ? '/' : '/admin'}
            sx={{
              color: 'white',
              textTransform: 'none',
            }}
          >
            {isAdmin ? 'Client Portal' : 'Admin Portal'}
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;