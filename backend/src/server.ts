// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import { Prisma } from '@prisma/client';
import Logger from './config/logger';
import { httpLogger } from './middleware/logging/httpLogger';
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

  // Middleware
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
  app.get('/api/db-test', async (req, res) => {
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
      Logger.error('Database connection test failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      res.status(500).json({
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Prisma error handler
  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      Logger.error('Database error:', {
        code: error.code,
        meta: error.meta,
        message: error.message,
        url: req.url,
        method: req.method
      });
      
      return res.status(400).json({
        error: 'Database operation failed',
        code: error.code,
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    next(error);
  });

  // 404 handler - debe ir después de todas las rutas pero antes del error handler global
  app.use((req: express.Request, res: express.Response) => {
    Logger.warn('Route not found', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.status(404).json({ 
      error: 'Route not found',
      path: req.originalUrl 
    });
  });

  // Global error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    Logger.error('Unhandled error:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      userId: req.user?.userId || 'anonymous'
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

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