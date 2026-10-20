import { describe, expect, it } from 'vitest';

import { wireguardConf } from '../wireguard-conf';
import { wireguardFileName } from '../wireguard-conf.helpers';

const INPUT = {
  privateKey: 'cHJpdmF0ZS1rZXk+/=',
  address: '10.9.0.7/32',
  dns: ['1.1.1.1', '8.8.8.8'],
  mtu: 1360,
  serverPublicKey: 'c2VydmVyLWtleQ==',
  host: '203.0.113.10',
  port: 51820,
  keepAlive: 25
};

describe('wireguardConf', () => {
  it('writes the file the official apps import', () => {
    expect(wireguardConf(INPUT)).toBe(
      [
        '[Interface]',
        'PrivateKey = cHJpdmF0ZS1rZXk+/=',
        'Address = 10.9.0.7/32',
        'DNS = 1.1.1.1, 8.8.8.8',
        'MTU = 1360',
        '',
        '[Peer]',
        'PublicKey = c2VydmVyLWtleQ==',
        'AllowedIPs = 0.0.0.0/0, ::/0',
        'Endpoint = 203.0.113.10:51820',
        'PersistentKeepalive = 25',
        ''
      ].join('\n')
    );
  });

  it('routes everything through the tunnel, IPv6 included, so nothing leaks around it', () => {
    expect(wireguardConf(INPUT)).toContain('AllowedIPs = 0.0.0.0/0, ::/0');
  });
});

describe('wireguardFileName', () => {
  const DEVICE_ID = '3f2a91c0-0000-4000-8000-000000000000';

  it('names the file after the device, transliterated, then a short id and the country', () => {
    expect(wireguardFileName({ name: 'Ноутбук', countryCode: 'NL', deviceId: DEVICE_ID })).toBe('noutbuk-3f2a-nl.conf');
  });

  it('keeps a brand name in one piece', () => {
    expect(wireguardFileName({ name: 'iPhone', countryCode: 'FI', deviceId: DEVICE_ID })).toBe('iphone-3f2a-fi.conf');
  });

  it('gives two devices with the same name different files, so the apps do not refuse the second', () => {
    const other = 'b71c0000-0000-4000-8000-000000000000';

    expect(wireguardFileName({ name: 'Ноутбук', countryCode: 'NL', deviceId: DEVICE_ID })).not.toBe(
      wireguardFileName({ name: 'Ноутбук', countryCode: 'NL', deviceId: other })
    );
  });

  it('stays within the 15 characters an interface name may have', () => {
    const name = wireguardFileName({ name: 'Рабочий ноутбук мамы', countryCode: 'DE', deviceId: DEVICE_ID }).replace('.conf', '');

    expect(name.length).toBeLessThanOrEqual(15);
    expect(name).toMatch(/^[\w=+.-]{1,15}$/u);
    expect(name).not.toMatch(/--/u);
  });

  it('falls back to a short id when the name has no letters to keep', () => {
    expect(wireguardFileName({ name: '😀', countryCode: 'NL', deviceId: DEVICE_ID })).toBe('gnome-3f2a-nl.conf');
    expect(wireguardFileName({ name: null, countryCode: 'N/L', deviceId: DEVICE_ID })).toBe('gnome-3f2a-nl.conf');
  });
});
