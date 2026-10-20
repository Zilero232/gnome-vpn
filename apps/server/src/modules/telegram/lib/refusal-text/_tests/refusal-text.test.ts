import { describe, expect, it, vi } from 'vitest';

import { AppBadRequestException } from '../../../../../common/exceptions';
import { refusalText } from '../refusal-text';

const COPIES = { REFERRAL_SELF: 'self', REFERRAL_CODE_INVALID: 'invalid' };

describe('refusalText', () => {
  it('answers a known refusal with its own copy, without reporting it', () => {
    const onUnknown = vi.fn();

    const text = refusalText({ error: new AppBadRequestException('REFERRAL_SELF', 'no'), copies: COPIES, fallback: 'later', onUnknown });

    expect(text).toBe('self');
    expect(onUnknown).not.toHaveBeenCalled();
  });

  it('falls back and reports an error it has no copy for, so a real failure is not passed off as a refusal', () => {
    const onUnknown = vi.fn();
    const error = new Error('database down');

    const text = refusalText({ error, copies: COPIES, fallback: 'later', onUnknown });

    expect(text).toBe('later');
    expect(onUnknown).toHaveBeenCalledWith(error);
  });

  it('treats a coded error outside the map as unknown', () => {
    const onUnknown = vi.fn();

    const text = refusalText({ error: new AppBadRequestException('REFERRAL_UNAVAILABLE', 'no'), copies: COPIES, fallback: 'later', onUnknown });

    expect(text).toBe('later');
    expect(onUnknown).toHaveBeenCalledTimes(1);
  });
});
