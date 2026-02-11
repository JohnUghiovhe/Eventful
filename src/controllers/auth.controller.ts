import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { EmailService } from '../services/email.service';
import { sanitizeUser } from '../utils/helpers';
import { Logger } from '../utils/logger';
import { AuthRequest } from '../types';
import dotenv from 'dotenv';
import passport from 'passport';

dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role, phoneNumber } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
        return;
      }

      // Create new user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role,
        phoneNumber
      });

      // Send welcome email (non-blocking)
      EmailService.sendWelcomeEmail(email, firstName).catch((error) => {
        Logger.error('Failed to send welcome email:', error);
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id.toString(), email: user.email, role: user.role },
        JWT_SECRET as jwt.Secret,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: sanitizeUser(user),
          token
        }
      });
    } catch (error: any) {
      Logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    Logger.info('Login attempt:', { email: req.body.email });
    
    return new Promise<void>((resolve) => {
      passport.authenticate('local', { session: false }, async (err: any, user: any, info: any) => {
        if (err) {
          Logger.error('Login error:', err);
          res.status(500).json({
            success: false,
            message: 'Login failed'
          });
          return resolve();
        }

        if (!user) {
          Logger.warn('Login failed - invalid credentials:', { email: req.body.email });
          res.status(401).json({
            success: false,
            message: info?.message || 'Invalid credentials'
          });
          return resolve();
        }

        // Fetch full user document from database
        try {
          const fullUser = await User.findById(user.id);
          if (!fullUser) {
            Logger.error('User document not found after authentication');
            res.status(500).json({
              success: false,
              message: 'Login failed'
            });
            return resolve();
          }

          // Generate JWT token
          const token = jwt.sign(
            { id: fullUser._id.toString(), email: fullUser.email, role: fullUser.role },
            JWT_SECRET as jwt.Secret,
            { expiresIn: '7d' }
          );

          Logger.info('Login successful:', { email: fullUser.email, id: fullUser._id });
          res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
              user: sanitizeUser(fullUser),
              token
            }
          });
        } catch (error) {
          Logger.error('Error fetching user after authentication:', error);
          res.status(500).json({
            success: false,
            message: 'Login failed'
          });
        }
        resolve();
      })(req, res);
    });
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: sanitizeUser(user)
      });
    } catch (error: any) {
      Logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { firstName, lastName, phoneNumber, profileImage } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { firstName, lastName, phoneNumber, profileImage },
        { new: true, runValidators: true }
      );

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: sanitizeUser(user)
      });
    } catch (error: any) {
      Logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }
}
