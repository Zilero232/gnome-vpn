import { describe, expect, it } from 'vitest';

import { wireguardConf, wireguardFileName } from '../wireguard-conf';

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
  it('names the file the way it becomes the tunnel name in the app', () => {
    expect(wireguardFileName({ countryCode: 'NL', deviceId: '3f2a91c0-0000-4000-8000-000000000000' })).toBe('gnome-nl-3f2a.conf');
  });

  it('stays within the 15 characters an interface name may have', () => {
    const name = wireguardFileName({ countryCode: 'DE', deviceId: 'abcdef12-0000-4000-8000-000000000000' }).replace('.conf', '');

    expect(name.length).toBeLessThanOrEqual(15);
    expect(name).toMatch(/^[\w=+.-]{1,15}$/u);
  });

  it('keeps only letters of the country code', () => {
    expect(wireguardFileName({ countryCode: 'N/L', deviceId: 'abcd' })).toBe('gnome-nl-abcd.conf');
  });
});
