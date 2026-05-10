import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resend } from '../../lib/resend.js';
import { supabaseAdmin } from '../../lib/supabaseAdmin.js';
import { otpService } from './otp.service.js';

vi.mock('../../lib/supabaseAdmin.js', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

vi.mock('../../lib/resend.js', () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
  resendFrom: 'noreply@example.com',
}));

describe('otpService', () => {
  const updateChain = {
    eq: vi.fn().mockResolvedValue({ error: null }),
  };

  const queryMock = {
    insert: vi.fn(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    update: vi.fn().mockReturnValue(updateChain),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseAdmin.from.mockReturnValue(queryMock);
    queryMock.insert.mockResolvedValue({ error: null });
    queryMock.maybeSingle.mockResolvedValue({ data: null, error: null });
    updateChain.eq.mockResolvedValue({ error: null });
    resend.emails.send.mockResolvedValue({});
  });

  it('inserts a token row and sends an email', async () => {
    const result = await otpService.generateAndSend(
      '11111111-1111-1111-1111-111111111111',
      'user@example.com',
      'email_verification'
    );

    expect(result.error).toBeNull();
    expect(supabaseAdmin.from).toHaveBeenCalledWith('verification_tokens');
    expect(queryMock.insert).toHaveBeenCalled();
    expect(resend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@example.com',
        to: 'user@example.com',
        subject: 'Your verification code',
      })
    );
  });

  it('returns valid true for a fresh token', async () => {
    queryMock.maybeSingle.mockResolvedValueOnce({
      data: {
        id: 1,
        user_id: 'uid',
        token: '123456',
        expires_at: new Date(Date.now() + 600000).toISOString(),
        used_at: null,
      },
      error: null,
    });

    const result = await otpService.verify(
      '11111111-1111-1111-1111-111111111111',
      '123456',
      'email_verification'
    );

    expect(result.valid).toBe(true);
    expect(queryMock.update).toHaveBeenCalledWith({
      used_at: expect.any(String),
    });
  });

  it('returns valid false for an expired token', async () => {
    queryMock.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const result = await otpService.verify(
      '11111111-1111-1111-1111-111111111111',
      '123456',
      'email_verification'
    );

    expect(result.valid).toBe(false);
    expect(queryMock.update).not.toHaveBeenCalled();
  });

  it('returns valid false for an already-used token', async () => {
    queryMock.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const result = await otpService.verify(
      '11111111-1111-1111-1111-111111111111',
      '123456',
      'email_verification'
    );

    expect(result.valid).toBe(false);
    expect(queryMock.update).not.toHaveBeenCalled();
  });
});
