import { TRIAL_DAYS } from '@gnomevpn/schemas';
import { addDays, addHours, subDays, subMinutes } from 'date-fns';
import { describe, expect, it } from 'vitest';

import type { WinBackRow } from '../win-back-touch.types';

import { NOTICE_CLAIM } from '../../../../../../../core';
import { WIN_BACK } from '../../../../../config';
import { liveCode, sentTouches, winBackDue, winBackMessage, winBackWindow } from '../win-back-touch';

const END = new Date('2026-10-01T12:00:00.000Z');

const claimed = ({ touch, end = END }: { touch: 1 | 2; end?: Date }) => [{ notice: NOTICE_CLAIM.winBackTouch[touch], ref: end.toISOString() }];

const paidRow = (overrides: Partial<WinBackRow> = {}): WinBackRow => ({
  currentPeriodEnd: END,
  trialStartedAt: null,
  claims: [],
  ...overrides
});

const trialRow = (overrides: Partial<WinBackRow> = {}): WinBackRow => paidRow({ trialStartedAt: subDays(END, TRIAL_DAYS), ...overrides });

const LAPSED = WIN_BACK.touchDays.lapsed;
const TRIAL = WIN_BACK.touchDays.trial;

describe('winBackDue for a lapsed payer', () => {
  it('owes nothing before the first touch', () => {
    expect(winBackDue({ row: paidRow(), hasPaid: true, now: subMinutes(addDays(END, LAPSED.first), 1) })).toBeNull();
  });

  it('owes the first touch from its day until the second one', () => {
    expect(winBackDue({ row: paidRow(), hasPaid: true, now: addDays(END, LAPSED.first) })).toEqual({ audience: 'lapsed', touch: 1 });
    expect(winBackDue({ row: paidRow(), hasPaid: true, now: subMinutes(addDays(END, LAPSED.second), 1) })).toEqual({ audience: 'lapsed', touch: 1 });
  });

  it('counts a period that came from a code or a gift as a paid one', () => {
    expect(winBackDue({ row: paidRow(), hasPaid: false, now: addDays(END, LAPSED.first) })).toEqual({ audience: 'lapsed', touch: 1 });
  });

  it('owes nothing more once the first touch went out for this lapse', () => {
    const row = paidRow({ claims: claimed({ touch: 1 }) });

    expect(winBackDue({ row, hasPaid: true, now: addDays(END, LAPSED.first + 1) })).toBeNull();
  });

  it('owes the second touch on its day, after the first', () => {
    const row = paidRow({ claims: claimed({ touch: 1 }) });

    expect(winBackDue({ row, hasPaid: true, now: addDays(END, LAPSED.second) })).toEqual({ audience: 'lapsed', touch: 2 });
  });

  it('jumps straight to the second touch when the first one was missed', () => {
    expect(winBackDue({ row: paidRow(), hasPaid: true, now: addHours(addDays(END, LAPSED.second), 2) })).toEqual({ audience: 'lapsed', touch: 2 });
  });

  it('owes nothing after both touches', () => {
    const row = paidRow({ claims: claimed({ touch: 2 }) });

    expect(winBackDue({ row, hasPaid: true, now: addDays(END, LAPSED.second + 1) })).toBeNull();
  });

  it('gives up on a lapse once the second touch is too late', () => {
    expect(winBackDue({ row: paidRow(), hasPaid: true, now: addDays(END, LAPSED.second + WIN_BACK.lateDays) })).toBeNull();
  });

  it('starts over for a new lapse, whatever the previous one was sent', () => {
    const row = paidRow({ claims: claimed({ touch: 2, end: subDays(END, 90) }) });

    expect(winBackDue({ row, hasPaid: true, now: addDays(END, LAPSED.first) })).toEqual({ audience: 'lapsed', touch: 1 });
  });
});

describe('winBackDue for a trial that was never paid', () => {
  it('owes the first touch a day after the trial and the second a week after', () => {
    expect(winBackDue({ row: trialRow(), hasPaid: false, now: subMinutes(addDays(END, TRIAL.first), 1) })).toBeNull();
    expect(winBackDue({ row: trialRow(), hasPaid: false, now: addDays(END, TRIAL.first) })).toEqual({ audience: 'trial', touch: 1 });

    expect(winBackDue({ row: trialRow({ claims: claimed({ touch: 1 }) }), hasPaid: false, now: addDays(END, TRIAL.second) })).toEqual({
      audience: 'trial',
      touch: 2
    });
  });

  it('leaves alone a trial whose account has paid, which is no trial-only account', () => {
    expect(winBackDue({ row: trialRow(), hasPaid: true, now: addDays(END, TRIAL.first) })).toBeNull();
  });
});

describe('sentTouches', () => {
  it('reads the last touch claimed for this lapse', () => {
    expect(sentTouches(paidRow())).toBe(0);
    expect(sentTouches(paidRow({ claims: claimed({ touch: 1 }) }))).toBe(1);
    expect(sentTouches(paidRow({ claims: [...claimed({ touch: 1 }), ...claimed({ touch: 2 })] }))).toBe(2);
  });

  it('ignores the touches of an earlier lapse', () => {
    expect(sentTouches(paidRow({ claims: claimed({ touch: 2, end: subDays(END, 90) }) }))).toBe(0);
  });
});

describe('winBackWindow', () => {
  it('spans every lapse that can still owe a touch', () => {
    const now = new Date('2026-10-23T12:00:00.000Z');
    const latest = Math.max(LAPSED.second, TRIAL.second) + WIN_BACK.lateDays;
    const earliest = Math.min(LAPSED.first, TRIAL.first);

    expect(winBackWindow(now)).toEqual({ from: subDays(now, latest), to: subDays(now, earliest) });
  });
});

describe('winBackMessage', () => {
  it('offers the audience its own discount when one was just granted', () => {
    expect(winBackMessage({ audience: 'lapsed', offer: { kind: 'granted', percent: 20 } })).toEqual({
      notice: WIN_BACK.offerNotice.lapsed,
      percent: 20
    });

    expect(winBackMessage({ audience: 'trial', offer: { kind: 'granted', percent: 20 } })).toEqual({
      notice: WIN_BACK.offerNotice.trial,
      percent: 20
    });
  });

  it('reminds of a discount the reader already holds, with its own percent', () => {
    expect(winBackMessage({ audience: 'trial', offer: { kind: 'held', percent: 15 } })).toEqual({ notice: WIN_BACK.reminderNotice, percent: 15 });
  });

  it('says nothing when the one win-back discount was already used', () => {
    expect(winBackMessage({ audience: 'lapsed', offer: { kind: 'used' } })).toBeNull();
  });
});

describe('liveCode', () => {
  const now = new Date('2026-10-23T12:00:00.000Z');
  const code = { id: 'code-1', code: WIN_BACK.codes.lapsed, percent: WIN_BACK.percent, expiresAt: null };

  it('keeps a code with no expiry, and one that expires later', () => {
    expect(liveCode({ code, now })).toBe(code);
    expect(liveCode({ code: { ...code, expiresAt: addDays(now, 1) }, now })?.id).toBe('code-1');
  });

  it('drops a code the owner stopped, which pauses its audience', () => {
    expect(liveCode({ code: { ...code, expiresAt: now }, now })).toBeNull();
  });

  it('passes a missing code through as missing', () => {
    expect(liveCode({ code: null, now })).toBeNull();
  });
});
