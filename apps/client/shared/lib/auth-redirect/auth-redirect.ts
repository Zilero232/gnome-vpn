import { AUTH_MODE, QUERY_PARAMS, ROUTES } from '@/shared/constants';

import type { AuthRedirectInput } from './auth-redirect.types';

import { AUTH_REDIRECT } from './auth-redirect.constants';

export const safeNextPath = (raw: string | null | undefined): string | null => {
  if (!raw?.startsWith('/') || raw.startsWith('//')) {
    return null;
  }

  try {
    const url = new URL(raw, AUTH_REDIRECT.probeOrigin);

    if (url.origin !== AUTH_REDIRECT.probeOrigin || url.pathname === ROUTES.auth) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
};

export const authRedirectHref = ({ pathname, search, hash }: AuthRedirectInput): string => {
  const query = new URLSearchParams(search);
  const isSignUp = query.get(QUERY_PARAMS.mode) === AUTH_MODE.signup;

  query.delete(QUERY_PARAMS.mode);

  const rest = query.toString();
  const params = new URLSearchParams({ [QUERY_PARAMS.next]: `${pathname}${rest ? `?${rest}` : ''}${hash}` });

  if (isSignUp) {
    params.set(QUERY_PARAMS.mode, AUTH_MODE.signup);
  }

  return `${ROUTES.auth}?${params.toString()}`;
};

export const postAuthHref = (search: string): string => safeNextPath(new URLSearchParams(search).get(QUERY_PARAMS.next)) ?? ROUTES.account;
