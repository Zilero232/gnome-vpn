import { subDays } from 'date-fns';
import { describe, expect, it } from 'vitest';

import type { ClientPresence } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.types';

import { QUIET_CLIENT } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.constants';

import { isQuietClient } from '../client-presence';

const EMAIL = 'cfg-user-incy-node';
const NOW = new Date('2026-11-01T04:17:00.000Z');

const presenceOf = ({ online = [], lastSeen }: { online?: string[]; lastSeen?: Date }): ClientPresence => ({
  online: new Set(online),
  lastOnline: new Map(lastSeen ? [[EMAIL, lastSeen]] : [])
});

describe('isQuietClient', () => {
  it('keeps a client that carries a session right now', () => {
    expect(isQuietClient({ email: EMAIL, presence: presenceOf({ online: [EMAIL] }), now: NOW })).toBe(false);
  });

  it('keeps a client that was online last evening, though it is offline at four in the morning', () => {
    expect(isQuietClient({ email: EMAIL, presence: presenceOf({ lastSeen: subDays(NOW, 1) }), now: NOW })).toBe(false);
  });

  it('lets go of a client that stayed offline for the whole idle window', () => {
    expect(isQuietClient({ email: EMAIL, presence: presenceOf({ lastSeen: subDays(NOW, QUIET_CLIENT.idleDays) }), now: NOW })).toBe(true);
  });

  it('lets go of a client the node has never seen online', () => {
    expect(isQuietClient({ email: EMAIL, presence: presenceOf({}), now: NOW })).toBe(true);
  });
});
