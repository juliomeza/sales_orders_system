# Sales Order System - Project Map

## Overview
A comprehensive sales order management system built with Node.js, Express, TypeScript, and Prisma, following a domain-driven design approach.

## System Architecture

### Core Technologies
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT-based
- Logging: Winston
- Testing: Jest

### Project Structure

```
backend/
├── prisma/                 # Database schema and migrations
├── src/
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── domain/           # Business logic and domain models
│   ├── middleware/       # Express middleware
│   ├── repositories/     # Data access layer
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic layer
│   └── shared/           # Shared utilities and types
```

## Domain Models

### Core Entities

1. **User**
   - Authentication and authorization
   - Roles: ADMIN, CLIENT
   - Associated with Customer (for client users)

2. **Customer**
   - Business entity that places orders
   - Has associated users, projects, and warehouses
   - Parent entity for many domain relationships

3. **Order**
   - Central business entity
   - Status workflow: DRAFT → SUBMITTED → PROCESSING → COMPLETED
   - Contains line items, shipping info, and carrier details

4. **Material**
   - Products/items that can be ordered
   - Associated with projects
   - Tracks inventory and order history

5. **Warehouse**
   - Physical locations for order fulfillment
   - Capacity management
   - Customer assignments

6. **Carrier**
   - Shipping providers
   - Contains carrier services with different delivery options

## Key Components

### Authentication & Authorization

- File: `src/middleware/auth.ts`
- JWT-based authentication
- Role-based access control
- Customer-scoped data access

### Request Flow

1. Request enters through routes
2. Passes through authentication middleware
3. Controllers handle request validation
4. Services contain business logic
5. Repositories handle data access
6. Domain models define business rules

### Error Handling

- Centralized error handler
- Standardized error responses
- Detailed logging with Winston
- Custom error types for different scenarios

### Data Access

- Prisma ORM for database operations
- Repository pattern implementation
- Transaction support for complex operations
- Soft delete support for key entities

## API Structure

### Main Routes

1. `/api/auth`
   - Authentication and user management
   - Login, registration, token refresh

2. `/api/orders`
   - Order CRUD operations
   - Status management
   - Order statistics

3. `/api/customers`
   - Customer management
   - Associated users and projects
   - Shipping/billing addresses

4. `/api/materials`
   - Material inventory management
   - Material search and filtering
   - Stock level tracking

5. `/api/warehouses`
   - Warehouse management
   - Capacity tracking
   - Customer assignments

6. `/api/carriers`
   - Carrier and service management
   - Shipping options configuration

## Configuration Files

### Key Configuration

1. **Database**
   - File: `src/config/database.ts`
   - Prisma client initialization
   - Connection management

2. **Logging**
   - File: `src/config/logger.ts`
   - Winston configuration
   - Log rotation setup

3. **Environment**
   - File: `.env`
   - Database connection
   - JWT secrets
   - Port configuration

## Validation & Types

### Type System

- Comprehensive TypeScript types
- Domain models
- DTOs for requests/responses
- Shared interfaces and enums

### Validation Layers

1. **Request Validation**
   - Input sanitization
   - Type checking
   - Business rule validation

2. **Domain Validation**
   - Business logic constraints
   - State transitions
   - Relationship rules

## Testing Strategy

### Test Structure

- Unit tests for services
- Integration tests for API endpoints
- Repository tests with test database
- Jest as testing framework

### Test Files

- Location: `src/**/__tests__/`
- Naming: `*.test.ts` or `*.spec.ts`
- Setup: `src/controllers/__tests__/setup.ts`

## File Request Guide

When requesting files for modifications, please specify:

1. The domain area (e.g., Orders, Materials)
2. The layer (Controller, Service, Repository)
3. Related files (e.g., DTOs, Types)
4. Test files if applicable

Example Request:
"Need to modify order creation logic in:
- src/controllers/ordersController.ts
- src/services/orderService.ts
- src/repositories/orderRepository.ts
- src/domain/order.ts"

## Dependencies

### Main Dependencies
- prisma: Database ORM
- express: Web framework
- jsonwebtoken: Authentication
- winston: Logging
- bcryptjs: Password hashing
- cors: CORS support

### Development Dependencies
- typescript: Type support
- jest: Testing framework
- ts-jest: TypeScript testing
- nodemon: Development server

## Maintenance Notes

1. **Database Migrations**
   - Use Prisma migrate
   - Test migrations in development
   - Backup before production updates

2. **Logging**
   - Structured logging format
   - Daily rotation
   - Multiple log levels

3. **Error Handling**
   - Custom error classes
   - Consistent error responses
   - Detailed logging

4. **Security**
   - JWT authentication
   - Password hashing
   - Role-based access
   - Customer data isolation
