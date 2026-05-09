import { resend, resendFrom } from '../../lib/resend.js';
import { supabaseAdmin } from '../../lib/supabaseAdmin.js';

const TOKEN_TTL_MINUTES = 10;
const PURPOSES = ['email_verification', 'password_reset', 'login'];

const generateToken = () => String(Math.floor(100000 + Math.random() * 900000));

/**
 * Server-side OTP generation and verification.
 * - Stores a one-time token in verification_tokens.
 * - Sends OTP emails through Resend.
 */
export const otpService = {
  generateAndSend: async (userId, email, purpose) => {
    if (!PURPOSES.includes(purpose)) {
      return {
        error: new Error(
          `Unsupported OTP purpose: ${purpose}. Must be one of ${PURPOSES.join(
            ', '
          )}`
        ),
      };
    }

    const token = generateToken();
    const expiresAt = new Date(
      Date.now() + TOKEN_TTL_MINUTES * 60 * 1000
    ).toISOString();

    const { error: insertError } = await supabaseAdmin
      .from('verification_tokens')
      .insert([
        {
          user_id: userId,
          purpose,
          token,
          expires_at: expiresAt,
        },
      ]);

    if (insertError) {
      return { error: insertError };
    }

    try {
      await resend.emails.send({
        from: resendFrom,
        to: email,
        subject: 'Your verification code',
        text: `Your verification code is ${token}. It expires in ${TOKEN_TTL_MINUTES} minutes.`,
      });
    } catch (sendError) {
      return {
        error:
          sendError instanceof Error
            ? sendError
            : new Error('Failed to send OTP email'),
      };
    }

    return { error: null };
  },

  verify: async (userId, token, purpose) => {
    const now = new Date().toISOString();

    const { data, error: fetchError } = await supabaseAdmin
      .from('verification_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('purpose', purpose)
      .eq('token', token)
      .eq('used_at', null)
      .gt('expires_at', now)
      .maybeSingle();

    if (fetchError) {
      return { valid: false, error: fetchError };
    }

    if (!data) {
      return { valid: false, error: null };
    }

    const { error: updateError } = await supabaseAdmin
      .from('verification_tokens')
      .update({ used_at: now })
      .eq('id', data.id);

    if (updateError) {
      return { valid: false, error: updateError };
    }

    if (purpose === 'email_verification') {
      const { error: verifyError } = await supabaseAdmin
        .from('users')
        .update({ is_verified: true })
        .eq('id', userId);

      if (verifyError) {
        return { valid: false, error: verifyError };
      }
    }

    return { valid: true, error: null };
  },
};
