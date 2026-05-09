import { otpService } from '../services/otp/otp.service.js';

/**
 * Controller for sending OTPs.
 */
export const sendOtp = async (req, res, next) => {
  const { userId, email, purpose } = req.body;

  const { error } = await otpService.generateAndSend(userId, email, purpose);
  if (error) {
    return next(error);
  }

  return res.status(200).json({ success: true });
};

/**
 * Controller for verifying OTPs.
 */
export const verifyOtp = async (req, res, next) => {
  const { userId, token, purpose } = req.body;

  const { valid, error } = await otpService.verify(userId, token, purpose);
  if (error) {
    return next(error);
  }

  return res.status(200).json({ valid });
};
