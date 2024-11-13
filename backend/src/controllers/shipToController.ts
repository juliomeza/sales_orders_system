// backend/src/controllers/shipToController.ts
import { Request, Response } from 'express';
import prisma from '../config/database';

export const shipToController = {
  // Get all addresses
  list: async (req: Request, res: Response) => {
    try {
      const customerId = req.user?.customerId;

      if (!customerId) {
        return res.status(400).json({ error: 'Customer ID is required' });
      }

      const accounts = await prisma.account.findMany({
        where: { 
          customerId: customerId,
          OR: [
            { accountType: 'SHIP_TO' },
            { accountType: 'BOTH' }
          ],
          status: 1
        },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          accountType: true,
          phone: true,
          email: true,
          contactName: true
        },
        orderBy: {
          name: 'asc'
        }
      });

      // Format the response to match the expected ShippingAddress interface
      const formattedAddresses = accounts.map(account => ({
        id: account.id.toString(),
        name: account.name,
        address: account.address,
        city: account.city,
        state: account.state,
        zipCode: account.zipCode,
        phone: account.phone || undefined,
        email: account.email || undefined,
        contactName: account.contactName || undefined
      }));

      res.json({ addresses: formattedAddresses });
    } catch (error) {
      console.error('List addresses error:', error);
      res.status(500).json({ error: 'Error listing addresses' });
    }
  },

  // Create new shipping address
  create: async (req: Request, res: Response) => {
    try {
      const { 
        name, 
        address, 
        city, 
        state, 
        zipCode,
        phone,
        email,
        contactName,
        accountType = 'SHIP_TO' // Default to SHIP_TO if not specified
      } = req.body;

      const customerId = req.user?.customerId;

      if (!customerId) {
        return res.status(400).json({ error: 'Customer ID is required' });
      }

      // Validate required fields
      if (!name || !address || !city || !state || !zipCode) {
        return res.status(400).json({
          error: 'Missing required fields',
          requiredFields: ['name', 'address', 'city', 'state', 'zipCode']
        });
      }

      // Create new account
      const newAccount = await prisma.account.create({
        data: {
          lookupCode: `${name.toUpperCase().replace(/\s+/g, '-')}`,
          name,
          address,
          city,
          state,
          zipCode,
          phone,
          email,
          contactName,
          accountType,
          customerId,
          status: 1,
          created_by: req.user?.userId || null,
          modified_by: req.user?.userId || null
        }
      });

      // Format the response
      const formattedAddress = {
        id: newAccount.id.toString(),
        name: newAccount.name,
        address: newAccount.address,
        city: newAccount.city,
        state: newAccount.state,
        zipCode: newAccount.zipCode,
        phone: newAccount.phone || undefined,
        email: newAccount.email || undefined,
        contactName: newAccount.contactName || undefined
      };

      res.status(201).json(formattedAddress);
    } catch (error) {
      console.error('Create address error:', error);
      res.status(500).json({ error: 'Error creating address' });
    }
  },

  // Get billing addresses
  getBillingAddresses: async (req: Request, res: Response) => {
    try {
      const customerId = req.user?.customerId;

      if (!customerId) {
        return res.status(400).json({ error: 'Customer ID is required' });
      }

      const accounts = await prisma.account.findMany({
        where: { 
          customerId: customerId,
          OR: [
            { accountType: 'BILL_TO' },
            { accountType: 'BOTH' }
          ],
          status: 1
        },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          accountType: true,
          phone: true,
          email: true,
          contactName: true
        },
        orderBy: {
          name: 'asc'
        }
      });

      const formattedAddresses = accounts.map(account => ({
        id: account.id.toString(),
        name: account.name,
        address: account.address,
        city: account.city,
        state: account.state,
        zipCode: account.zipCode,
        phone: account.phone || undefined,
        email: account.email || undefined,
        contactName: account.contactName || undefined
      }));

      res.json({ addresses: formattedAddresses });
    } catch (error) {
      console.error('List billing addresses error:', error);
      res.status(500).json({ error: 'Error listing billing addresses' });
    }
  }
};