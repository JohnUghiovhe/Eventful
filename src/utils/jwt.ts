import * as jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { IUser } from '../models';

export interface ITokenPayload {
  userId: string;
  email: string;
  role: 'creator' | 'eventee';
}

export interface IDecodedToken extends ITokenPayload {
  iat: number;
  exp: number;
}

export class JWTService {
  static generateToken(user: IUser): string {
    const payload: ITokenPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    };

    const expiresIn = config.JWT_EXPIRY || '7d';
    
    return jwt.sign(payload, config.JWT_SECRET as string, { expiresIn } as any);
  }

  static verifyToken(token: string): IDecodedToken {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as IDecodedToken;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static decodeToken(token: string): IDecodedToken | null {
    try {
      const decoded = jwt.decode(token) as IDecodedToken;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  static refreshToken(token: string): string {
    try {
      const decoded = this.verifyToken(token);
      const user = {
        _id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      } as unknown as IUser;
      return this.generateToken(user);
    } catch (error) {
      throw new Error('Cannot refresh token');
    }
  }
}

export default JWTService;
