import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import {
  isNotAuthenticated,
  isAuthenticated,
} from '../middleware/auth/auth.middleware.js';
import {
  validateSignup,
  validateLogin,
} from '../validators/auth/auth.validator.js';

const authRouter = Router();

// Public: registration and login
authRouter.post(
  '/sign-up',
  isNotAuthenticated,
  validateSignup,
  authController.signupPost
);
authRouter.post(
  '/log-in',
  isNotAuthenticated,
  validateLogin,
  authController.loginPost
);

// Protected: identity and session management
authRouter.get('/me', isAuthenticated, authController.getMe);
authRouter.get('/log-out', isAuthenticated, authController.logoutGet);

export default authRouter;
