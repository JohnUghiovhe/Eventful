import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthenticatedRequest } from '../middleware/auth';
import { res as respond } from '../utils/response';
import Logger from '../utils/logger';

export class AuthController {
  static async signUp(req: Request, res: Response): Promise<void> {
    try {
      Logger.request('POST', '/api/auth/signup');
      const { firstName, lastName, email, password, phone, role } = req.body;
      if (!firstName || !lastName || !email || !password || !phone || !role) {
        Logger.warn('Signup validation failed', { email, missing: 'Check fields' });
        respond.err(res, 400, 'All fields required');
        return;
      }
      const result = await AuthService.signUp({ firstName, lastName, email, password, phone, role });
      if (result.status === 'success') {
        Logger.success('User created', { email, role, userId: result.data?.user?._id });
        res.status(201).json(result);
      } else {
        Logger.warn('Signup failed', { email, message: result.message });
        res.status(400).json(result);
      }
      Logger.response('POST', '/api/auth/signup', res.statusCode, result.message);
    } catch (error: any) {
      Logger.error('Signup error', error.message);
      respond.err(res, 500, error.message || 'Signup error');
    }
  }

  static async signIn(req: Request, res: Response): Promise<void> {
    try {
      Logger.request('POST', '/api/auth/signin');
      const { email, password } = req.body;
      if (!email || !password) {
        Logger.warn('Signin validation failed', { email });
        respond.err(res, 400, 'Email and password required');
        return;
      }
      const result = await AuthService.signIn({ email, password });
      if (result.status === 'success') {
        Logger.success('User signed in', { email, userId: result.data?.user?._id });
        res.status(200).json(result);
      } else {
        Logger.warn('Signin failed', { email, message: result.message });
        respond.unauthorized(res, result.message);
      }
      Logger.response('POST', '/api/auth/signin', res.statusCode, result.message);
    } catch (error: any) {
      Logger.error('Signin error', error.message);
      respond.err(res, 500, error.message || 'Signin error');
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      Logger.request('GET', '/api/auth/profile', req.userId);
      if (!req.userId) {
        Logger.warn('Profile request without auth');
        respond.unauthorized(res);
        return;
      }
      const user = await AuthService.getUserById(req.userId);
      if (!user) {
        Logger.warn('User not found', { userId: req.userId });
        respond.notFound(res, 'User not found');
        return;
      }
      Logger.success('Profile retrieved', { userId: req.userId });
      respond.ok(res, 200, 'Profile', user);
      Logger.response('GET', '/api/auth/profile', res.statusCode, 'Profile retrieved');
    } catch (error: any) {
      Logger.error('Profile fetch error', error.message);
      respond.err(res, 500, error.message || 'Error fetching profile');
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      Logger.request('PATCH', '/api/auth/profile', req.userId);
      if (!req.userId) {
        Logger.warn('Profile update without auth');
        respond.unauthorized(res);
        return;
      }
      const { firstName, lastName, phone, bio, profileImage, socialLinks } = req.body;
      const updates = { ...(firstName && { firstName }), ...(lastName && { lastName }), ...(phone && { phone }), ...(bio && { bio }), ...(profileImage && { profileImage }), ...(socialLinks && { socialLinks }) };
      const user = await AuthService.updateUser(req.userId, updates);
      if (!user) {
        Logger.warn('User not found for update', { userId: req.userId });
        respond.notFound(res, 'User not found');
        return;
      }
      Logger.success('Profile updated', { userId: req.userId, fields: Object.keys(updates) });
      respond.ok(res, 200, 'Profile updated', user);
      Logger.response('PATCH', '/api/auth/profile', res.statusCode, 'Profile updated');
    } catch (error: any) {
      Logger.error('Profile update error', error.message);
      respond.err(res, 500, error.message || 'Update error');
    }
  }
}

export default AuthController;