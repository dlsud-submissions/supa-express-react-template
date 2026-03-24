import { clearAuthCookie } from '../../utils/auth/cookie/cookie.js';

/**
 * Global Error Handling Middleware.
 * - Intercepts all errors passed via next(err).
 * - Standardizes the response format for the frontend.
 * - Forces cookie clearance on authentication failures.
 * @param {Error} err - The error object.
 * @param {Request} req - Express request.
 * @param {Response} res - Express response.
 * @param {NextFunction} next - Express next function.
 */
export const globalErrorHandler = (err, req, res, next) => {
  // Use status code from AppError or default to 500
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Wipe auth cookie if the error is an authentication failure
  if (err.statusCode === 401) {
    clearAuthCookie(res);
  }

  // Return standardized JSON structure
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    errors: err.errors || [], // Specifically for ValidationError arrays
  });
};
