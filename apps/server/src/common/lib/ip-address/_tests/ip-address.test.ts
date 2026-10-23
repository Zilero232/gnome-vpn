import { describe, expect, it } from 'vitest';

import { canonicalIp, isIpAddress } from '../ip-address';

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
    expect(canonicalIp('2001:0DB8::0010')).toBe('2001:db8::10');
  });

  it('leaves an IPv4 address as it is', () => {
    expect(canonicalIp('203.0.113.10')).toBe('203.0.113.10');
  });

  it('unmaps an IPv4 address that arrives mapped into IPv6, in either notation', () => {
    expect(canonicalIp('::ffff:203.0.113.10')).toBe('203.0.113.10');
    expect(canonicalIp('::FFFF:CB00:710A')).toBe('203.0.113.10');
  });

  it('refuses anything that is not an address', () => {
    expect(canonicalIp('nl.gnome-vpn.com')).toBeNull();
    expect(canonicalIp('')).toBeNull();
    expect(canonicalIp('0x7f.1')).toBeNull();
  });
});
