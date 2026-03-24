import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { isAuthenticated } from '../middleware/auth/auth.middleware.js';

const userRouter = Router();

// Apply authentication safety net to all routes
userRouter.use(isAuthenticated);

// Profile endpoints
userRouter.get('/profile', userController.profileGet);
userRouter.get('/profile/:id', userController.getUserById);

export default userRouter;
