import { describe, expect, it } from 'vitest';

import { PERSONAL_DATA_CONSENT_VERSION } from '../consents.constants';
import { recordPersonalDataConsentSchema, unsubscribeQuerySchema, updateMarketingConsentSchema } from '../consents.schemas';

describe('recordPersonalDataConsentSchema', () => {
  it('takes the current version from sign-up', () => {
    expect(recordPersonalDataConsentSchema.safeParse({ version: PERSONAL_DATA_CONSENT_VERSION, source: 'signup' }).success).toBe(true);
  });

  it('refuses a version that is not a date, so the record always names a published text', () => {
    expect(recordPersonalDataConsentSchema.safeParse({ version: 'latest', source: 'signup' }).success).toBe(false);
  });

  it('refuses a source the site cannot be, since the bot and the email record their own', () => {
    expect(recordPersonalDataConsentSchema.safeParse({ version: PERSONAL_DATA_CONSENT_VERSION, source: 'telegram' }).success).toBe(false);
  });
});

describe('updateMarketingConsentSchema', () => {
  it('takes a choice made at sign-up or in the account', () => {
    expect(updateMarketingConsentSchema.safeParse({ granted: true, source: 'signup' }).success).toBe(true);
    expect(updateMarketingConsentSchema.safeParse({ granted: false, source: 'account' }).success).toBe(true);
  });

  it('refuses the bot and email sources, which only the server writes', () => {
    expect(updateMarketingConsentSchema.safeParse({ granted: false, source: 'email' }).success).toBe(false);
    expect(updateMarketingConsentSchema.safeParse({ granted: true, source: 'bot' }).success).toBe(false);
  });
});

describe('unsubscribeQuerySchema', () => {
  it('reads a missing token as an empty one, so the page always gets an answer to render', () => {
    expect(unsubscribeQuerySchema.parse({})).toEqual({ token: '' });
  });
});
