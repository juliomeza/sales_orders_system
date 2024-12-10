// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error/errorHandler';
import { httpLogger } from './middleware/logging/httpLogger';
import Logger from './config/logger';
import prisma from './config/database';

// Import routes
import authRoutes from './routes/authRoutes';
import orderRoutes from './routes/orderRoutes';
import materialsRoutes from './routes/materialsRoutes';
import carriersRoutes from './routes/carriersRoutes';
import warehousesRoutes from './routes/warehousesRoutes';
import shipToRoutes from './routes/shipToRoutes';
import customersRoutes from './routes/customersRoutes';

export const createServer = () => {
  const app = express();

  // Logging middleware
  app.use(httpLogger);

  // Basic middleware
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/materials', materialsRoutes);
  app.use('/api/carriers', carriersRoutes);
  app.use('/api/warehouses', warehousesRoutes);
  app.use('/api/ship-to', shipToRoutes);
  app.use('/api/customers', customersRoutes);

  // Root route
  app.get('/', (req, res) => {
    Logger.info('API root accessed', { 
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.json({ 
      message: 'Welcome to Sales Order API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        orders: '/api/orders',
        materials: '/api/materials',
        carriers: '/api/carriers',
        warehouses: '/api/warehouses',
        'ship-to': '/api/ship-to',
        health: '/api/health',
        dbTest: '/api/db-test'
      }
    });
  });

  // Health check route
  app.get('/api/health', (req, res) => {
    Logger.debug('Health check requested');
    
    res.json({
      status: 'ok',
      timestamp: new Date(),
      uptime: process.uptime()
    });
  });

  // Test database connection
  app.get('/api/db-test', async (req, res, next) => {
    Logger.info('Database test requested');
    
    try {
      const result = await prisma.$queryRaw`SELECT 1 as result`;
      
      const userCount = await prisma.user.count();
      const customerCount = await prisma.customer.count();
      const orderCount = await prisma.order.count();
      const materialCount = await prisma.material.count();

      Logger.info('Database test successful', {
        counts: {
          users: userCount,
          customers: customerCount,
          orders: orderCount,
          materials: materialCount
        }
      });

      res.json({
        message: 'Database connection successful',
        tables: {
          users: userCount,
          customers: customerCount,
          orders: orderCount,
          materials: materialCount
        }
      });
    } catch (error) {
      next(error); // Usar el nuevo error handler
    }
  });

  // 404 handler - debe ir después de todas las rutas pero antes del error handler
  app.use((req, res, next) => {
    Logger.warn('Route not found', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    next(new Error('Route not found')); // Será manejado por el error handler global
  });

  // Global error handler - debe ser el último middleware
  app.use(errorHandler);

  return app;
};

// Server initialization
if (require.main === module) {
  const app = createServer();
  const port = process.env.PORT || 3001;
  
  const server = app.listen(port, () => {
    Logger.info('Server initialized', {
      port,
      nodeEnv: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });

  // Graceful shutdown handlers
  process.on('SIGTERM', () => {
    Logger.info('SIGTERM signal received');
    server.close(() => {
      Logger.info('HTTP server closed');
      prisma.$disconnect()
        .then(() => {
          Logger.info('Database connection closed');
          process.exit(0);
        })
        .catch((error) => {
          Logger.error('Error disconnecting from database', { error });
          process.exit(1);
        });
    });
  });

  // Uncaught exception handler
  process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception:', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  });

  // Unhandled rejection handler
  process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection:', {
      reason,
      promise
    });
    process.exit(1);
  });
}

export default createServer;