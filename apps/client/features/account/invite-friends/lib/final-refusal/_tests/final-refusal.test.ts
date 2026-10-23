import { describe, expect, it } from 'vitest';

import { ApiError } from '@/shared/api';

import { isFinalRefusal } from '../final-refusal';

describe('isFinalRefusal', () => {
  it('treats the referral refusals as final, so the stored invite is dropped', () => {
    for (const code of ['REFERRAL_CODE_INVALID', 'REFERRAL_SELF', 'REFERRAL_UNAVAILABLE', 'VALIDATION_FAILED'] as const) {
      expect(isFinalRefusal(new ApiError({ code, message: 'no' })), code).toBe(true);
    }
  });

  it('treats a promo code that can never apply as final too', () => {
    for (const code of ['PROMO_CODE_INVALID', 'PROMO_CODE_EXPIRED', 'PROMO_CODE_USED_UP', 'PROMO_CODE_ALREADY_USED'] as const) {
      expect(isFinalRefusal(new ApiError({ code, message: 'no' })), code).toBe(true);
    }
  });

  it('keeps the code after a failure that a later visit can get past', () => {
    expect(isFinalRefusal(new ApiError({ code: 'UNAUTHORIZED', message: 'no' }))).toBe(false);
    expect(isFinalRefusal(new ApiError({ code: 'INTERNAL_ERROR', message: 'no' }))).toBe(false);
    expect(isFinalRefusal(new Error('Network Error'))).toBe(false);
  });
});
