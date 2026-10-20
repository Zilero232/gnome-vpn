import { DEFAULT_DEVICE_LIMIT } from '@gnomevpn/schemas';
import { addHours, subHours } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { graceDeviceLimit, slotHolders } from '../device-slots';

const at = (iso: string) => new Date(iso);

describe('slotHolders', () => {
  const devices = [
    { id: 'c', createdAt: at('2026-10-03T00:00:00Z') },
    { id: 'a', createdAt: at('2026-10-01T00:00:00Z') },
    { id: 'b', createdAt: at('2026-10-02T00:00:00Z') }
  ];

  it('keeps the oldest devices within the limit', () => {
    expect(slotHolders({ devices, limit: 2 })).toEqual(new Set(['a', 'b']));
  });

  it('holds every device when the limit covers them', () => {
    expect(slotHolders({ devices, limit: 5 })).toEqual(new Set(['a', 'b', 'c']));
  });

  it('breaks a tie on creation time by id, so the answer never flips between calls', () => {
    const tied = [
      { id: 'y', createdAt: at('2026-10-01T00:00:00Z') },
      { id: 'x', createdAt: at('2026-10-01T00:00:00Z') }
    ];

    expect(slotHolders({ devices: tied, limit: 1 })).toEqual(new Set(['x']));
  });

  it('holds nothing at a zero limit', () => {
    expect(slotHolders({ devices, limit: 0 }).size).toBe(0);
  });
});

describe('graceDeviceLimit', () => {
  const now = at('2026-10-20T12:00:00Z');

  it('counts the paid extras while the period runs', () => {
    expect(graceDeviceLimit({ subscription: { currentPeriodEnd: addHours(now, 5), extraDevices: 2 }, now })).toBe(DEFAULT_DEVICE_LIMIT + 2);
  });

  it('keeps the paid extras for a renewal a few hours late', () => {
    expect(graceDeviceLimit({ subscription: { currentPeriodEnd: subHours(now, 1), extraDevices: 2 }, now })).toBe(DEFAULT_DEVICE_LIMIT + 2);
  });

  it('drops to the default once the grace is over', () => {
    expect(graceDeviceLimit({ subscription: { currentPeriodEnd: subHours(now, 7), extraDevices: 2 }, now })).toBe(DEFAULT_DEVICE_LIMIT);
  });

  it('gives an account without a subscription the default', () => {
    expect(graceDeviceLimit({ subscription: null, now })).toBe(DEFAULT_DEVICE_LIMIT);
  });
});
