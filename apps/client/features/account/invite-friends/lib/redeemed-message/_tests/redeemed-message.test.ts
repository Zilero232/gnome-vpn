import type { PromoRedemption } from '@gnomevpn/schemas';

import { PROMO_REDEMPTION_KINDS } from '@gnomevpn/schemas';
import { createTranslator } from 'next-intl';
import { describe, expect, it } from 'vitest';

import { messages } from '@/shared/i18n';

import { redeemedMessage } from '../redeemed-message';

const result = (overrides: Partial<PromoRedemption>): PromoRedemption => ({
  kind: 'friend',
  percent: null,
  days: null,
  currentPeriodEnd: null,
  ...overrides
});

const SAMPLES: PromoRedemption[] = [
  result({ kind: 'friend' }),
  result({ kind: 'discount', percent: 20 }),
  result({ kind: 'days', days: 30, currentPeriodEnd: '2026-12-01T00:00:00.000Z' }),
  result({ kind: 'gift', days: 365, currentPeriodEnd: '2027-10-23T00:00:00.000Z' })
];

describe('redeemedMessage', () => {
  it('has a message for every kind of redemption the API reports', () => {
    expect(SAMPLES.map((sample) => sample.kind).sort()).toEqual([...PROMO_REDEMPTION_KINDS].sort());
  });

  it('lands on a message that exists in both locales, filled with what was granted', () => {
    for (const locale of ['ru', 'en'] as const) {
      const t = createTranslator({ locale, messages: messages[locale], namespace: 'referrals' });

      for (const sample of SAMPLES) {
        const { key, values } = redeemedMessage(sample);
        const text = t(key, values);

        expect(text, `${locale} ${sample.kind}`).not.toContain('redeemed.');

        if (sample.percent !== null) {
          expect(text).toContain(String(sample.percent));
        }

        if (sample.days !== null) {
          expect(text).toContain(String(sample.days));
        }
      }
    }
  });

  it('tells the kinds apart, so a discount never reads as bonus days', () => {
    const keys = SAMPLES.map((sample) => redeemedMessage(sample).key);

    expect(new Set(keys).size).toBe(SAMPLES.length);
  });
});
