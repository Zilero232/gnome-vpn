import type { Device } from '@gnomevpn/schemas';

import { describe, expect, it } from 'vitest';

import { REMOVAL_KIND } from '../../../config';
import { removalKind } from '../removal-kind';

const device = (overrides: Partial<Device> = {}): Device => ({
  id: 'device-1',
  model: 'Pixel 8',
  platform: 'Android',
  osVersion: '14',
  app: 'INCY',
  isIdentified: true,
  isOverLimit: false,
  createdAt: '2026-10-01T00:00:00.000Z',
  lastSeenAt: '2026-10-20T00:00:00.000Z',
  ...overrides
});

describe('removalKind', () => {
  it('treats a WireGuard config as gone for good once removed', () => {
    expect(removalKind(device({ app: 'WireGuard', isIdentified: false, model: 'Laptop', platform: null }))).toBe(REMOVAL_KIND.wireguard);
  });

  it('tells INCY without HWID sending apart, since it cannot take a place again', () => {
    expect(removalKind(device({ isIdentified: false }))).toBe(REMOVAL_KIND.incyWithoutHwid);
  });

  it('treats any other app as one that comes back on its next refresh', () => {
    expect(removalKind(device())).toBe(REMOVAL_KIND.app);
    expect(removalKind(device({ app: 'Hiddify', isIdentified: false }))).toBe(REMOVAL_KIND.app);
  });
});
