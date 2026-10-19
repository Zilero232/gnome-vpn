import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it } from 'vitest';

import { REFERRAL_COOKIE } from '@/shared/constants';

import { referralFromUrl, rememberReferral } from '../referral-cookie';

const remembered = (request: NextRequest) => {
  const response = NextResponse.next();

  rememberReferral({ request, response });

  return response.cookies.get(REFERRAL_COOKIE.name)?.value;
};

describe('referralFromUrl', () => {
  it('reads and normalises a well-formed code', () => {
    expect(referralFromUrl(new URL('https://gnome-vpn.com/?ref=abcdef23'))).toBe('ABCDEF23');
  });

  it('ignores a missing or malformed code', () => {
    expect(referralFromUrl(new URL('https://gnome-vpn.com/'))).toBeNull();
    expect(referralFromUrl(new URL('https://gnome-vpn.com/?ref=<script>'))).toBeNull();
  });
});

describe('rememberReferral', () => {
  it('stores the code from the link for a month', () => {
    const response = NextResponse.next();

    rememberReferral({ request: new NextRequest('https://gnome-vpn.com/pricing?ref=ABCDEF23'), response });

    const cookie = response.cookies.get(REFERRAL_COOKIE.name);

    expect(cookie?.value).toBe('ABCDEF23');
    expect(cookie?.maxAge).toBe(REFERRAL_COOKIE.maxAgeSeconds);
  });

  it('keeps the first invite when a second link is opened', () => {
    const request = new NextRequest('https://gnome-vpn.com/?ref=ZZZZZZZZ', { headers: { cookie: `${REFERRAL_COOKIE.name}=ABCDEF23` } });

    expect(remembered(request)).toBeUndefined();
  });

  it('stores nothing without a valid code', () => {
    expect(remembered(new NextRequest('https://gnome-vpn.com/?ref=nope'))).toBeUndefined();
  });
});
