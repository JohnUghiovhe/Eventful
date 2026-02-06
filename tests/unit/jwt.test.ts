import { JWTService } from '../../src/utils/jwt';

describe('JWT Service', () => {
  const mockUser = {
    _id: '123456789',
    email: 'test@example.com',
    role: 'eventee' as const,
  };

  it('should generate a valid token', () => {
    const token = JWTService.generateToken(mockUser as any);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should verify a valid token', () => {
    const token = JWTService.generateToken(mockUser as any);
    const decoded = JWTService.verifyToken(token);

    expect(decoded.userId).toBe(mockUser._id);
    expect(decoded.email).toBe(mockUser.email);
    expect(decoded.role).toBe(mockUser.role);
  });

  it('should throw error for invalid token', () => {
    expect(() => {
      JWTService.verifyToken('invalid.token.here');
    }).toThrow('Invalid or expired token');
  });

  it('should decode token without verifying signature', () => {
    const token = JWTService.generateToken(mockUser as any);
    const decoded = JWTService.decodeToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(mockUser._id);
  });

  it('should return null for invalid token when decoding', () => {
    const decoded = JWTService.decodeToken('invalid.token');
    expect(decoded).toBeNull();
  });
});
