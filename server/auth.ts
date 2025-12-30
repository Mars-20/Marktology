import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { storage, verifyPassword } from './storage';
import type { User } from '@shared/schema';

// Configure Passport Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isValid = await verifyPassword(password, user.password);
        
        if (!isValid) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        if (user.status !== 'active') {
          return done(null, false, { message: 'Account is inactive' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user to session
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as User).id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
