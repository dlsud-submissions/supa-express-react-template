/**
 * Global Error Handling Middleware.
 * - Intercepts all errors passed via next(err).
 * - Standardizes the response format for the frontend.
 * - Cookie clearing removed — auth is now handled by Supabase client-side.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    errors: err.errors || [],
  });
};
