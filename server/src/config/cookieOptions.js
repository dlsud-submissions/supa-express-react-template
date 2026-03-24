// Define 30 days in milliseconds
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

/**
 * Shared configuration for authentication cookies.
 * - httpOnly: Prevents client-side JS from accessing the token (XSS protection).
 * - secure: Ensures cookies are only sent over HTTPS in production.
 * - sameSite: Protects against CSRF attacks.
 */
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: THIRTY_DAYS,
};
