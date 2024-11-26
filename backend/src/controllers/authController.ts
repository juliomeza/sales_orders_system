// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/auth/authService';
import { UserRepository } from '../repositories/userRepository';
import prisma from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET!;

export class AuthController {
  private authService: AuthService;

  constructor(authService?: AuthService) {
    this.authService = authService || new AuthService(
      new UserRepository(prisma),
      JWT_SECRET
    );

    // Bind de los métodos para mantener el contexto
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  async login(req: Request, res: Response) {
    const result = await this.authService.login(req.body);
    
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    res.json(result.data);
  }

  async register(req: Request, res: Response) {
    const result = await this.authService.register(req.body);
    
    if (!result.success) {
      if (result.error === 'User already exists') {
        return res.status(409).json({ error: result.error });
      }
      if (result.errors) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: result.errors
        });
      }
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json(result.data);
  }

  async getCurrentUser(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const result = await this.authService.getCurrentUser(req.user.userId);
    
    if (!result.success) {
      if (result.error === 'User not found') {
        return res.status(404).json({ error: result.error });
      }
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  }

  async refreshToken(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const result = await this.authService.refreshToken(req.user.userId);
    
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    res.json({ token: result.data });
  }
}

// Exportar instancia por defecto para mantener compatibilidad
export const authController = new AuthController();