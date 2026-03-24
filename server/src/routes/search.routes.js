import { Router } from 'express';
import * as searchController from '../controllers/search.controller.js';
import { isAuthenticated } from '../middleware/auth/auth.middleware.js';

const searchRouter = Router();

// All search endpoints require an active session
searchRouter.use(isAuthenticated);

searchRouter.get('/', searchController.searchGet);

export default searchRouter;
