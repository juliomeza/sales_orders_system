# Sales Order System Frontend - Project Map

## Overview
A React-based frontend application for the Sales Order System, built with TypeScript, Material-UI (MUI), and React Router, following a component-based architecture with clear separation of concerns.

## Core Technologies

- React 18.x with TypeScript
- Material-UI (MUI) for UI components
- React Router for navigation
- Formik for form handling
- Axios for API communication
- React Query for server state management

## Project Structure

```
frontend/
├── src/
│   ├── admin/              # Admin-specific components and logic
│   │   ├── app/           # Admin application wrapper
│   │   └── customers/     # Customer management module
│   ├── client/            # Client-specific components and logic
│   │   ├── app/          # Client application wrapper
│   │   ├── orders/       # Order management
│   │   └── components/   # Client-specific shared components
│   └── shared/           # Shared components and utilities
       ├── api/           # API client and services
       ├── auth/          # Authentication components and context
       ├── components/    # Shared UI components
       ├── hooks/         # Custom React hooks
       └── types/         # TypeScript type definitions
```

## Key Components

### Application Core

1. **App.tsx**
   - Root component
   - Theme provider setup
   - Routing configuration
   - Authentication provider

2. **App.theme.tsx**
   - MUI theme customization
   - Color palette definition
   - Typography settings
   - Component style overrides

3. **App.routes.tsx**
   - Route definitions
   - Role-based access control
   - Navigation structure

### Authentication

1. **AuthContext.tsx**
   - User authentication state
   - Login/logout functionality
   - Role-based access control
   - Token management

2. **LoginPage.tsx**
   - User authentication interface
   - Form validation
   - Error handling

3. **ProtectedRoute.tsx**
   - Route access control
   - Role verification
   - Authentication state checking

### Admin Module

1. **AdminApp.tsx**
   - Admin portal layout
   - Navigation structure
   - Module routing

2. **Customer Management**
   - Components:
     - CustomerManagement.tsx (main component)
     - CustomerDialog.tsx (create/edit form)
     - CustomerTable.tsx (listing)
   - Features:
     - CRUD operations
     - Search functionality
     - Form validation
     - Status management

### Client Module

1. **ClientApp.tsx**
   - Client portal layout
   - Order management interface
   - Navigation structure

2. **Order Creation Flow**
   - Components:
     - OrderCreationFlow.tsx (main component)
     - OrderHeaderStep.tsx (basic info)
     - InventoryStep.tsx (item selection)
     - ReviewStep.tsx (order review)
   - Features:
     - Multi-step form
     - Real-time validation
     - Item selection
     - Order review

### Shared Components

1. **Navigation Components**
   - Navigation.tsx (main navigation bar)
   - UserMenu.tsx (user actions menu)

2. **Form Components**
   - FormTextField.tsx
   - AddressFields.tsx
   - StatusToggle.tsx

3. **Table Components**
   - CustomersTable.tsx
   - InventoryTable.tsx
   - ProjectsTable.tsx

## Custom Hooks

1. **useAccounts**
   - Account management
   - Address handling
   - Shipping/billing logic

2. **useInventory**
   - Inventory item management
   - Search functionality
   - Quantity tracking

3. **useOrderCreationFlow**
   - Order creation state management
   - Multi-step form control
   - Validation logic

4. **useShipping**
   - Carrier selection
   - Service type management
   - Warehouse selection

## State Management

1. **Context Usage**
   - AuthContext for user authentication
   - Theme context for styling
   - Form contexts for complex forms

2. **Local State**
   - Component-specific state
   - Form state management
   - UI state (loading, errors)

## API Integration

1. **apiClient.ts**
   - Axios instance configuration
   - Request/response interceptors
   - Error handling
   - Authentication header management

2. **Service Modules**
   - Warehouse service
   - Customer service
   - Order service
   - Material service

## Type System

### Core Types

1. **Shipping Types**
   - ShippingAddress
   - Carrier
   - Warehouse
   - InventoryItem
   - OrderData

2. **Domain Types**
   - Customer
   - Project
   - User
   - ValidationError

## Styling Approach

1. **Theme Configuration**
   - Custom MUI theme
   - Color palette
   - Typography
   - Component default props

2. **Component Styling**
   - MUI styled components
   - CSS-in-JS
   - Responsive design utilities

## File Request Guide

When requesting files for modifications, specify:

1. The module (Admin, Client, Shared)
2. Component type (Page, Form, Dialog, etc.)
3. Related components and hooks
4. Style customizations if applicable

Example Request:
"Need to modify order creation flow in:
- src/client/orders/components/creation/OrderCreationFlow.tsx
- src/shared/hooks/useOrderCreationFlow.ts
- src/client/orders/components/steps/*"

## Dependencies

### Main Dependencies
- @mui/material: UI components
- @mui/icons-material: Icons
- react-router-dom: Routing
- formik: Form handling
- axios: HTTP client
- date-fns: Date manipulation

### Development Dependencies
- typescript: Type support
- @types/*: Type definitions
- @testing-library/react: Testing utilities

## Environment Configuration

### Key Files
- .env: Environment variables
- tsconfig.json: TypeScript configuration
- package.json: Dependencies and scripts

### Environment Variables
- REACT_APP_API_URL: Backend API URL
- Additional configuration as needed

## Best Practices

1. **Component Organization**
   - Feature-based structure
   - Shared components separation
   - Clear component responsibilities

2. **State Management**
   - Context for global state
   - Hooks for reusable logic
   - Local state when appropriate

3. **Type Safety**
   - Strong typing
   - Interface definitions
   - Type guards when needed

4. **Error Handling**
   - Consistent error boundaries
   - User-friendly error messages
   - Loading states
