import { Router } from 'express';

const indexRouter = Router();

/**
 * Health check endpoint.
 * - Used by CI and monitoring to verify the server is running.
 * - No auth required.
 */
indexRouter.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default indexRouter;
