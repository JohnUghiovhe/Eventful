import { Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthRequest, UserRole } from '../types';

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (err) {
      res.status(500).json({ success: false, message: 'Authentication error' });
      return;
    }
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    req.user = user;
    next();
  })(req, res, next);
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions'
      });
      return;
    }

    next();
  };
};

export const isCreator = authorize(UserRole.CREATOR);
export const isEventee = authorize(UserRole.EVENTEE);
export const isCreatorOrEventee = authorize(UserRole.CREATOR, UserRole.EVENTEE);
