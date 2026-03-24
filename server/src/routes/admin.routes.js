import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import {
  isAuthenticated,
  isAdmin,
} from '../middleware/auth/auth.middleware.js';

const adminRouter = Router();

// Require both a valid session AND admin privileges
adminRouter.use(isAuthenticated);
adminRouter.use(isAdmin);

// User management routes
adminRouter.get('/users', adminController.usersGet);
adminRouter.post('/users/:id/promote', adminController.promotePost);
adminRouter.post('/users/:id/demote', adminController.demotePost);

export default adminRouter;
