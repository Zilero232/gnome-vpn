import { describe, expect, it } from 'vitest';

import { canonicalIp, countryForIp, isIpAddress } from '../ip-address';

const ADDRESSES = [
  { address: '203.0.113.10', countryCode: 'NL' },
  { address: '2001:db8::10', countryCode: 'DE' }
];

describe('isIpAddress', () => {
  it('tells a literal address from a hostname', () => {
    expect(isIpAddress('203.0.113.10')).toBe(true);
    expect(isIpAddress('2001:db8::10')).toBe(true);
    expect(isIpAddress('nl.gnome-vpn.com')).toBe(false);
  });
});

describe('canonicalIp', () => {
  it('writes one IPv6 address one way, whatever case and zero padding it came in', () => {
    expect(canonicalIp('2001:DB8:0:0:0:0:0:10')).toBe(canonicalIp('2001:db8::10'));
  });

  it('leaves an IPv4 address as it is', () => {
    expect(canonicalIp('203.0.113.10')).toBe('203.0.113.10');
  });

  it('refuses anything that is not an address', () => {
    expect(canonicalIp('nl.gnome-vpn.com')).toBeNull();
    expect(canonicalIp('')).toBeNull();
  });
});

describe('countryForIp', () => {
  it('names the country of the node an address belongs to', () => {
    expect(countryForIp({ addresses: ADDRESSES, ip: '203.0.113.10' })).toBe('NL');
  });

  it('matches an IPv6 address written differently from the resolved one', () => {
    expect(countryForIp({ addresses: ADDRESSES, ip: '2001:0DB8::0010' })).toBe('DE');
  });

  it('matches an IPv4 address that arrives mapped into IPv6, in either notation', () => {
    expect(countryForIp({ addresses: ADDRESSES, ip: '::ffff:203.0.113.10' })).toBe('NL');
    expect(countryForIp({ addresses: ADDRESSES, ip: '::FFFF:CB00:710A' })).toBe('NL');
  });

  it('answers nothing for an address that is not one of ours', () => {
    expect(countryForIp({ addresses: ADDRESSES, ip: '198.51.100.7' })).toBeNull();
  });

  it('answers nothing for a value that is not an address at all', () => {
    expect(countryForIp({ addresses: ADDRESSES, ip: 'not-an-ip' })).toBeNull();
  });
});
