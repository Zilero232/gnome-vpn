import { PROMO_CODE } from '@gnomevpn/schemas';
import { addDays, subMinutes } from 'date-fns';
import { keys } from 'remeda';
import { describe, expect, it } from 'vitest';

import type { CampaignSummary } from '../../../../promo-codes';

import { BOT_LOCALES, BOT_TEXT } from '../../../config';
import { isTelegramHtml } from '../../html';
import { campaignCreatedText, campaignLine, campaignListText, campaignProblemText } from '../promo-text';
import { CAMPAIGN_PROBLEM_TEXT } from '../promo-text.constants';

const NOW = new Date('2026-10-23T12:00:00.000Z');
const LINK = 'https://gnome-vpn.com/?promo=BLOGGER20';

const campaign = (patch: Partial<CampaignSummary>): CampaignSummary => ({
  id: 'id',
  code: 'BLOGGER20',
  kind: 'discount',
  percent: 20,
  days: null,
  maxUses: null,
  expiresAt: null,
  createdAt: NOW,
  used: 3,
  ...patch
});

describe('campaignCreatedText', () => {
  it('names the code and what it gives, with the limits only when they are set', () => {
    for (const locale of BOT_LOCALES) {
      const plain = campaignCreatedText({ campaign: campaign({}), link: LINK, locale });
      const limited = campaignCreatedText({ campaign: campaign({ maxUses: 100, expiresAt: addDays(NOW, 30) }), link: LINK, locale });

      expect(plain).toContain('BLOGGER20');
      expect(plain).toContain(LINK);
      expect(plain).toContain('20%');
      expect(plain).not.toContain('100');
      expect(limited).toContain('100');
      expect(isTelegramHtml(limited)).toBe(true);
    }
  });
});

describe('campaignLine', () => {
  it('says how many times a code was used, out of its limit when it has one', () => {
    for (const locale of BOT_LOCALES) {
      expect(campaignLine({ campaign: campaign({ used: 7 }), locale, now: NOW })).toContain('7');
      expect(campaignLine({ campaign: campaign({ used: 7, maxUses: 50 }), locale, now: NOW })).toContain('50');
    }
  });

  it('marks a code whose expiry has passed as stopped, and shows the expiry of a live one', () => {
    for (const locale of BOT_LOCALES) {
      const stopped = campaignLine({ campaign: campaign({ expiresAt: subMinutes(NOW, 1) }), locale, now: NOW });
      const live = campaignLine({ campaign: campaign({ expiresAt: addDays(NOW, 5) }), locale, now: NOW });

      expect(stopped).toContain(BOT_TEXT[locale].promoStoppedMark);
      expect(live).not.toContain(BOT_TEXT[locale].promoStoppedMark);
    }
  });

  it('describes bonus days rather than a percent for a days code', () => {
    for (const locale of BOT_LOCALES) {
      const line = campaignLine({ campaign: campaign({ kind: 'days', percent: null, days: 14 }), locale, now: NOW });

      expect(line).toContain('14');
      expect(line).not.toContain('%');
    }
  });
});

describe('campaignListText', () => {
  it('always opens with the usage, then the codes or a note that there are none', () => {
    for (const locale of BOT_LOCALES) {
      const empty = campaignListText({ campaigns: [], locale, now: NOW });
      const listed = campaignListText({
        campaigns: [campaign({}), campaign({ code: 'WELCOME', kind: 'days', percent: null, days: 7 })],
        locale,
        now: NOW
      });

      expect(empty.startsWith(BOT_TEXT[locale].promoUsage)).toBe(true);
      expect(empty).toContain(BOT_TEXT[locale].promoListEmpty);
      expect(listed).toContain('WELCOME');
      expect(listed).not.toContain(BOT_TEXT[locale].promoListEmpty);
      expect(isTelegramHtml(listed)).toBe(true);
    }
  });
});

describe('campaignProblemText', () => {
  it('has a filled-in sentence for every problem in every language', () => {
    for (const locale of BOT_LOCALES) {
      for (const problem of keys(CAMPAIGN_PROBLEM_TEXT)) {
        expect(campaignProblemText({ problem, locale })).not.toMatch(/\{\w+\}/u);
      }
    }
  });

  it('quotes the real length limits of a code', () => {
    for (const locale of BOT_LOCALES) {
      const text = campaignProblemText({ problem: 'codeFormat', locale });

      expect(text).toContain(String(PROMO_CODE.minLength));
      expect(text).toContain(String(PROMO_CODE.maxLength));
    }
  });
});
