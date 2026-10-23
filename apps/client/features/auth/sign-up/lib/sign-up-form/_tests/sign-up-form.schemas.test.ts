import { signUpSchema } from '@gnomevpn/schemas';
import { describe, expect, it } from 'vitest';

import { signUpFormSchema } from '../sign-up-form.schemas';

const VALID = { email: 'gnome@example.com', password: 'longenough', promoCode: '', isConsentGiven: true, isMarketingConsentGiven: false };

describe('signUpFormSchema', () => {
  it('accepts a sign-up with the consent box ticked', () => {
    expect(signUpFormSchema.safeParse(VALID).success).toBe(true);
  });

  it('leaves the offers box optional', () => {
    expect(signUpFormSchema.safeParse({ ...VALID, isMarketingConsentGiven: true }).success).toBe(true);
    expect(signUpFormSchema.safeParse(VALID).success).toBe(true);
  });

  it('refuses an unticked consent box with its own message', () => {
    const result = signUpFormSchema.safeParse({ ...VALID, isConsentGiven: false });

    expect(result.success).toBe(false);

    expect(result.error?.issues.map(({ path, message }) => ({ path, message }))).toEqual([
      { path: ['isConsentGiven'], message: 'validation.consentRequired' }
    ]);
  });

  it('leaves the shared contract alone, so the consents never reach the sign-up request', () => {
    expect(signUpSchema.shape).not.toHaveProperty('isConsentGiven');
    expect(signUpSchema.shape).not.toHaveProperty('isMarketingConsentGiven');
  });
});
