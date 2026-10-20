import { describe, expect, it } from 'vitest';

import { authRedirectHref, postAuthHref, safeNextPath } from '../auth-redirect';

describe('safeNextPath', () => {
  it('keeps a path on this site with its query and hash', () => {
    expect(safeNextPath('/account?plan=yearly#connect')).toBe('/account?plan=yearly#connect');
  });

  it('refuses an absolute URL', () => {
    expect(safeNextPath('https://evil.example/account')).toBeNull();
  });

  it('refuses a protocol-relative URL', () => {
    expect(safeNextPath('//evil.example/account')).toBeNull();
  });

  it('refuses a backslash trick that browsers read as another host', () => {
    expect(safeNextPath('/\\evil.example')).toBeNull();
  });

  it('refuses a javascript URL', () => {
    expect(safeNextPath('javascript:alert(1)')).toBeNull();
  });

  it('refuses the sign-in page itself, which would loop', () => {
    expect(safeNextPath('/auth?next=/account')).toBeNull();
  });

  it('answers nothing for a missing value', () => {
    expect(safeNextPath(null)).toBeNull();
  });
});

describe('authRedirectHref', () => {
  it('carries the page, its query and its hash to the sign-in page', () => {
    const href = authRedirectHref({ pathname: '/account', search: '?plan=yearly', hash: '#subscription' });

    expect(new URLSearchParams(href.split('?').slice(1).join('?')).get('next')).toBe('/account?plan=yearly#subscription');
  });

  it('moves a sign-up hint onto the sign-in page rather than into the way back', () => {
    const href = authRedirectHref({ pathname: '/account', search: '?plan=monthly&mode=signup', hash: '' });
    const params = new URLSearchParams(href.slice(href.indexOf('?')));

    expect(params.get('mode')).toBe('signup');
    expect(params.get('next')).toBe('/account?plan=monthly');
  });
});

describe('postAuthHref', () => {
  it('goes back to where the reader was sent from', () => {
    expect(postAuthHref('?next=%2Faccount%23connect')).toBe('/account#connect');
  });

  it('falls back to the account for anything off-site', () => {
    expect(postAuthHref('?next=https%3A%2F%2Fevil.example')).toBe('/account');
  });

  it('falls back to the account without a next', () => {
    expect(postAuthHref('')).toBe('/account');
  });
});
