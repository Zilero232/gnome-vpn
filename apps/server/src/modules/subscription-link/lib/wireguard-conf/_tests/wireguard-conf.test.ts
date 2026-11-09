import { describe, expect, it } from 'vitest';

import { wireguardConf } from '../wireguard-conf';
import { WIREGUARD_CONF } from '../wireguard-conf.constants';
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
  it('names the first config of a country by the brand and the country alone', () => {
    expect(wireguardFileName({ countryCode: 'NL', ordinal: 1 })).toBe(`${WIREGUARD_CONF.fileBrand}-NL${WIREGUARD_CONF.fileExtension}`);
  });

  it('numbers every later config of the same country, so the apps do not refuse the second import', () => {
    const names = [1, 2, 3].map((ordinal) => wireguardFileName({ countryCode: 'NL', ordinal }));

    expect(new Set(names).size).toBe(names.length);
    expect(names[1]).toBe(`${WIREGUARD_CONF.fileBrand}-NL-2${WIREGUARD_CONF.fileExtension}`);
  });

  it('stays within the characters and the length an interface name may have', () => {
    const name = wireguardFileName({ countryCode: 'DE', ordinal: 99 }).replace(WIREGUARD_CONF.fileExtension, '');

    expect(name.length).toBeLessThanOrEqual(WIREGUARD_CONF.tunnelNameLength);
    expect(name).toMatch(/^[\w=+.-]+$/u);
  });

  it('drops anything from the country code that is not a letter', () => {
    expect(wireguardFileName({ countryCode: 'n/l', ordinal: 1 })).toBe(wireguardFileName({ countryCode: 'NL', ordinal: 1 }));
  });
});
