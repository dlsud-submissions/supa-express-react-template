import { Router } from 'express';
import otpRouter from './otp.routes.js';

const indexRouter = Router();

/**
 * Health check endpoint.
 * - Used by CI and monitoring to verify the server is running.
 * - No auth required.
 */
indexRouter.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// OTP verification endpoints are protected by service-role bearer auth.
indexRouter.use('/api/otp', otpRouter);

export default indexRouter;
