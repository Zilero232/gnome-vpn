import { describe, expect, it } from 'vitest';

import { DEVICE_PEER } from '@/modules/devices/config';

import { deviceIpLimit } from '../device-identity';

describe('deviceIpLimit', () => {
  it('lets a device with a hardware id use its keys from two networks at once', () => {
    expect(deviceIpLimit('hwid:270DD26E-160D-4257-B8AC-654800E12F24')).toBe(DEVICE_PEER.ipsPerClient);
  });

  it('holds an app that sends no hardware id to one network, since every install of it shares the keys', () => {
    expect(deviceIpLimit('app:hiddify')).toBe(DEVICE_PEER.ipsPerKeylessClient);
  });

  it('treats a WireGuard config and an unknown key like an identified device', () => {
    expect(deviceIpLimit('wg:3f2a9c1e-7b44-4c1d-9e0a-2b55aa001122')).toBe(DEVICE_PEER.ipsPerClient);
    expect(deviceIpLimit(null)).toBe(DEVICE_PEER.ipsPerClient);
  });
});
