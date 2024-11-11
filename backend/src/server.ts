// src/server.ts
import express from 'express';
import cors from 'cors';
import prisma from './config/database';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Sales Order API',
    endpoints: {
      dbTest: '/api/db-test',
      health: '/api/health'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Test database connection
app.get('/api/db-test', async (req, res) => {
  try {
    // Attempt to query the database
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    
    // Get table counts
    const userCount = await prisma.user.count();
    const customerCount = await prisma.customer.count();
    const orderCount = await prisma.order.count();
    const materialCount = await prisma.material.count();

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
    console.error('Database connection error:', error);
    res.status(500).json({
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling for unhandled routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Test database connection at http://localhost:${port}/api/db-test`);
});