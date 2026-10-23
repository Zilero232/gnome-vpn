import { describe, expect, it } from 'vitest';

import { ADMIN_PARAMS, ADMIN_TAB, ROUTES } from '@/shared/constants';

import { adminUserPath, userParamOf, withUserParam } from '../admin-href';

const PAGE = `https://gnome-vpn.com${ROUTES.admin}`;

describe('adminUserPath', () => {
  it('opens the users tab on the card of that user', () => {
    const url = new URL(adminUserPath('3f0c5d2e-1111-4222-8333-944445555666'), PAGE);

    expect(url.pathname).toBe(ROUTES.admin);
    expect(url.hash).toBe(`#${ADMIN_TAB.users}`);
    expect(userParamOf(url.search)).toBe('3f0c5d2e-1111-4222-8333-944445555666');
  });

  it('encodes whatever it is given rather than breaking the query', () => {
    expect(userParamOf(new URL(adminUserPath('a&b=c'), PAGE).search)).toBe('a&b=c');
  });
});

describe('userParamOf', () => {
  it('answers null when no user is selected', () => {
    expect(userParamOf('')).toBeNull();
    expect(userParamOf('?other=1')).toBeNull();
  });
});

describe('withUserParam', () => {
  it('selects a user and switches to the users tab', () => {
    const url = withUserParam({ href: `${PAGE}#${ADMIN_TAB.overview}`, userId: 'u1' });

    expect(url.searchParams.get(ADMIN_PARAMS.user)).toBe('u1');
    expect(url.hash).toBe(`#${ADMIN_TAB.users}`);
  });

  it('drops the user and keeps the tab when the card closes', () => {
    const url = withUserParam({ href: `${PAGE}?${ADMIN_PARAMS.user}=u1#${ADMIN_TAB.users}`, userId: null });

    expect(url.searchParams.has(ADMIN_PARAMS.user)).toBe(false);
    expect(url.hash).toBe(`#${ADMIN_TAB.users}`);
  });
});
