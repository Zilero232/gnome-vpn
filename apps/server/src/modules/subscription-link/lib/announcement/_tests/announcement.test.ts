import { addDays, subDays, subMinutes } from 'date-fns';
import { describe, expect, it } from 'vitest';

import type { AnnouncementNode } from '../announcement.types';

import { announcement } from '../announcement';
import { ANNOUNCE, ANNOUNCEMENTS, HWID_HINT } from '../announcement.constants';
import { hwidHint } from '../announcement.helpers';

const NOW = new Date('2026-06-01T12:00:00.000Z');

const node = (overrides: Partial<AnnouncementNode> = {}): AnnouncementNode => ({
  country: 'Нидерланды',
  createdAt: subDays(NOW, ANNOUNCE.freshNodeDays + 1),
  lastHealthyAt: NOW,
  ...overrides
});

const active = {
  hasSubscription: true,
  currentPeriodEnd: addDays(NOW, ANNOUNCE.expiryWarningDays + 30),
  nodes: [node()],
  now: NOW
};

describe('announcement', () => {
  it('says nothing when the subscription is healthy and every node is settled', () => {
    expect(announcement(active)).toBeNull();
  });

  it('speaks up when there is no subscription at all', () => {
    expect(announcement({ ...active, hasSubscription: false, currentPeriodEnd: null })).not.toBeNull();
  });

  it('tells a device over the account limit why it has no servers', () => {
    expect(announcement({ ...active, blockedAtLimit: 2 })).toBe(ANNOUNCEMENTS.deviceLimit(2));
  });

  it('tells a device whose servers could not be issued yet to refresh, rather than leaving the list empty', () => {
    expect(announcement({ ...active, isPreparing: true })).toBe(ANNOUNCEMENTS.preparing);
  });

  it('puts the device limit before the servers being prepared', () => {
    expect(announcement({ ...active, blockedAtLimit: 2, isPreparing: true })).toBe(ANNOUNCEMENTS.deviceLimit(2));
  });

  it('still reports a lapsed subscription before the device limit', () => {
    expect(announcement({ ...active, currentPeriodEnd: subDays(NOW, 1), blockedAtLimit: 2 })).toBe(ANNOUNCEMENTS.expired);
  });

  it('tells INCY without HWID sending why a new install gets no servers', () => {
    expect(announcement({ ...active, hwidHint: HWID_HINT.required })).toBe(ANNOUNCEMENTS.hwidRequired);
  });

  it('asks an INCY install that already holds a place to switch HWID sending on', () => {
    expect(announcement({ ...active, hwidHint: HWID_HINT.nudge })).toBe(ANNOUNCEMENTS.hwidNudge);
  });

  it('puts an expiry warning before the HWID nudge, and the nudge before a down node', () => {
    const expiring = { ...active, currentPeriodEnd: addDays(NOW, 2) };

    expect(announcement({ ...expiring, hwidHint: HWID_HINT.nudge })).not.toBe(ANNOUNCEMENTS.hwidNudge);
    expect(announcement({ ...active, hwidHint: HWID_HINT.nudge, nodes: [node({ lastHealthyAt: null })] })).toBe(ANNOUNCEMENTS.hwidNudge);
  });

  it('distinguishes a lapsed subscription from one that was never bought', () => {
    const expired = announcement({ ...active, currentPeriodEnd: subDays(NOW, 1) });

    expect(expired).not.toBeNull();
    expect(expired).not.toBe(announcement({ ...active, hasSubscription: false, currentPeriodEnd: null }));
  });

  it('warns inside the expiry window', () => {
    expect(announcement({ ...active, currentPeriodEnd: addDays(NOW, ANNOUNCE.expiryWarningDays) })).not.toBeNull();
  });

  it('stays quiet one day beyond the expiry window', () => {
    expect(announcement({ ...active, currentPeriodEnd: addDays(NOW, ANNOUNCE.expiryWarningDays + 1) })).toBeNull();
  });

  it('reports a node whose last healthy probe has gone stale', () => {
    const stale = [node({ lastHealthyAt: subMinutes(NOW, ANNOUNCE.nodeStaleMinutes) })];

    expect(announcement({ ...active, nodes: stale })).toContain('Нидерланды');
  });

  it('treats a node that has never reported as down rather than as new', () => {
    const never = [node({ lastHealthyAt: null })];

    expect(announcement({ ...active, nodes: never })).toContain('Нидерланды');
  });

  it('names a node added inside the fresh window', () => {
    const fresh = [node({ country: 'Германия', createdAt: subDays(NOW, ANNOUNCE.freshNodeDays - 1) })];

    expect(announcement({ ...active, nodes: fresh })).toContain('Германия');
  });

  it('prefers the expiry over anything happening to the nodes', () => {
    const expiring = { ...active, currentPeriodEnd: addDays(NOW, 1), nodes: [node({ lastHealthyAt: null })] };

    expect(announcement(expiring)).not.toContain('Нидерланды');
  });

  it('prefers a node that is down over a node that is new', () => {
    const mixed = [node({ lastHealthyAt: null }), node({ country: 'Германия', createdAt: NOW })];

    expect(announcement({ ...active, nodes: mixed })).not.toContain('Германия');
  });

  it('names each country once, however many nodes it holds', () => {
    const twin = [node({ lastHealthyAt: null }), node({ lastHealthyAt: null })];
    const rendered = announcement({ ...active, nodes: twin }) ?? '';

    expect(rendered.match(/Нидерланды/g)).toHaveLength(1);
  });

  it('joins several countries the way the language does, not with a bare comma', () => {
    const two = [node({ lastHealthyAt: null }), node({ country: 'Германия', lastHealthyAt: null })];

    expect(announcement({ ...active, nodes: two })).toContain('Нидерланды и Германия');
  });

  it('declines the day count, so a single day does not read as a plural', () => {
    const oneDay = announcement({ ...active, currentPeriodEnd: addDays(NOW, 1) });

    expect(oneDay).toBe(ANNOUNCEMENTS.expiringInDays(`1 ${ANNOUNCE.dayForms.one}`));
  });

  it('declines the day count for the rest of the warning window', () => {
    const threeDays = announcement({ ...active, currentPeriodEnd: addDays(NOW, 3) });

    expect(threeDays).toBe(ANNOUNCEMENTS.expiringInDays(`3 ${ANNOUNCE.dayForms.few}`));
  });
});

describe('hwidHint', () => {
  it('refuses a new INCY install that sends no hardware id', () => {
    expect(hwidHint({ needsHwid: true, isKeyless: true, deviceId: null })).toBe(HWID_HINT.required);
  });

  it('nudges an INCY install without one that already holds a place', () => {
    expect(hwidHint({ needsHwid: false, isKeyless: true, deviceId: 'device-1' })).toBe(HWID_HINT.nudge);
  });

  it('says nothing to a device that sends its hardware id', () => {
    expect(hwidHint({ needsHwid: false, isKeyless: false, deviceId: 'device-1' })).toBeNull();
  });
});
