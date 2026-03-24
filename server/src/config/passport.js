import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import * as userQueries from '../db/queries/user/user.queries.js';

/**
 * Verifies credentials via Local Strategy.
 * - Checks username existence.
 * - Validates hashed password.
 * @param {string} username - User login identifier.
 * @param {string} password - Raw password string.
 * @param {function} done - Passport callback.
 */
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Find user by username using normalized user queries
      const user = await userQueries.getUserByUsername(username);
      if (!user) return done(null, false, { message: 'User does not exist' });

      // Compare provided password with stored hash
      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: 'Incorrect password' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

/**
 * Extracts JWT from cookies or Authorization header.
 * @param {Object} req - Express request.
 * @returns {string|null} The extracted token.
 */
const cookieOrHeaderExtractor = (req) => {
  // Extract from HttpOnly cookie
  if (req?.cookies?.token) return req.cookies.token;
  // Extract from Bearer token
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

/**
 * Authenticates requests via JWT Strategy.
 * - Decodes token payload.
 * - Verifies user identity via ID.
 * @param {Object} payload - Decoded JWT data.
 * @param {function} done - Passport callback.
 */
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: cookieOrHeaderExtractor,
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        // Fetch user by ID using normalized user queries
        const user = await userQueries.getUserById(payload.id);
        if (!user) return done(null, false);

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
