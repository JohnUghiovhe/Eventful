import { Request, Response, NextFunction } from 'express';
import JWTService, { IDecodedToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: IDecodedToken;
  userId?: string;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'No token provided',
      });
      return;
    }

    const decoded = JWTService.verifyToken(token);
    req.user = decoded;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    res.status(403).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }
};

export const authorizeRole = (...allowedRoles: Array<'creator' | 'eventee'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden: Insufficient permissions',
      });
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = JWTService.verifyToken(token);
      req.user = decoded;
      req.userId = decoded.userId;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    next();
  }
};

export default {
  authenticateToken,
  authorizeRole,
  optionalAuth,
};
