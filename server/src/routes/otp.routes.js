import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { sendOtp, verifyOtp } from '../controllers/otp.controller.js';
import { AuthenticationError, ValidationError } from '../errors/AppError.js';

const otpRouter = Router();

const requireServiceRoleBearer = (req, res, next) => {
  const authHeader = req.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (token !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return next(new AuthenticationError('Invalid service bearer token'));
  }

  next();
};

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ValidationError('Validation failed', errors.array()));
  }
  next();
};

otpRouter.post(
  '/send',
  requireServiceRoleBearer,
  [
    body('userId').isUUID().withMessage('userId must be a valid UUID'),
    body('email').isEmail().withMessage('email must be valid'),
    body('purpose').isString().notEmpty().withMessage('purpose is required'),
  ],
  validateRequest,
  sendOtp
);

otpRouter.post(
  '/verify',
  requireServiceRoleBearer,
  [
    body('userId').isUUID().withMessage('userId must be a valid UUID'),
    body('token')
      .isLength({ min: 6, max: 6 })
      .withMessage('token must be a 6-digit code'),
    body('purpose').isString().notEmpty().withMessage('purpose is required'),
  ],
  validateRequest,
  verifyOtp
);

export default otpRouter;
