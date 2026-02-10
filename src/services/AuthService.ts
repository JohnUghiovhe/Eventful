import { User, IUser } from '../models';
import JWTService from '../utils/jwt';

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: 'creator' | 'eventee';
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data?: {
    user: Partial<IUser>;
    token: string;
  };
}

export class AuthService {
  private static userResponse(user: IUser, includeProfileImage = false) {
    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phoneNumber,
      role: user.role,
      ...(includeProfileImage && { profileImage: user.profileImage }),
      createdAt: user.createdAt,
    };
  }

  private static authResponse(user: IUser, message: string, includeProfileImage = false): AuthResponse {
    return {
      status: 'success',
      message,
      data: {
        user: this.userResponse(user, includeProfileImage),
        token: JWTService.generateToken(user),
      },
    };
  }

  static async signUp(data: SignUpRequest): Promise<AuthResponse> {
    try {
      const existing = await User.findOne({ email: data.email });
      if (existing) return { status: 'error', message: 'Email already registered' };

      const newUser = await User.create(data);
      return this.authResponse(newUser, 'User registered successfully');
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Signup failed' };
    }
  }

  static async signIn(data: SignInRequest): Promise<AuthResponse> {
    try {
      const user = await User.findOne({ email: data.email }).select('+password');
      if (!user || !(await user.comparePassword(data.password))) {
        return { status: 'error', message: 'Invalid email or password' };
      }
      return this.authResponse(user, 'Signed in successfully', true);
    } catch (error: any) {
      return { status: 'error', message: error.message || 'Signin failed' };
    }
  }

  static async getUserById(userId: string): Promise<Partial<IUser> | null> {
    try {
      return await User.findById(userId).select('-password');
    } catch {
      return null;
    }
  }

  static async updateUser(userId: string, updates: Partial<IUser>): Promise<Partial<IUser> | null> {
    try {
      return await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    } catch {
      return null;
    }
  }

  static async verifyEmail(email: string): Promise<boolean> {
    try {
      await User.updateOne({ email }, { isEmailVerified: true });
      return true;
    } catch {
      return false;
    }
  }
}

export default AuthService;
