import 'dotenv/config';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromAddress = process.env.RESEND_FROM_ADDRESS;

if (!resendApiKey) {
  throw new Error('Missing environment variable: RESEND_API_KEY');
}

if (!resendFromAddress) {
  throw new Error('Missing environment variable: RESEND_FROM_ADDRESS');
}

/**
 * Resend SDK singleton for server-side email delivery.
 * - Uses the server-only Resend API key from env.
 */
export const resend = new Resend(resendApiKey);
export const resendFrom = resendFromAddress;
