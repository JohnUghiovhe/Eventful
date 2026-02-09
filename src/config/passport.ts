import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import User from '../models/User';
import { Logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Local Strategy for login
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email: string, password: string, done: any) => {
      try {
        Logger.info('LocalStrategy authenticating:', { email });
        
        const user = await User.findOne({ email });
        if (!user) {
          Logger.warn('User not found:', { email });
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          Logger.warn('Password mismatch:', { email });
          return done(null, false, { message: 'Invalid credentials' });
        }

        Logger.info('LocalStrategy authentication successful:', { email });
        return done(null, { 
          id: user._id, 
          email: user.email, 
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          _id: user._id
        });
      } catch (error) {
        Logger.error('LocalStrategy error:', error);
        return done(error);
      }
    }
  )
);

// JWT Strategy for protected routes
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload: any, done: any) => {
    try {
      const user = await User.findById(payload.id);
      if (user) {
        return done(null, { id: user._id, email: user.email, role: user.role });
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
