import { ADMIN_PARAMS, ADMIN_TAB, ROUTES } from '@/shared/constants';

import type { UserHrefInput } from './admin-href.types';

export const adminUserPath = (userId: string): string =>
  `${ROUTES.admin}?${new URLSearchParams({ [ADMIN_PARAMS.user]: userId }).toString()}#${ADMIN_TAB.users}`;

export const userParamOf = (search: string): string | null => new URLSearchParams(search).get(ADMIN_PARAMS.user);

export const withUserParam = ({ href, userId }: UserHrefInput): URL => {
  const url = new URL(href);

  if (userId) {
    url.searchParams.set(ADMIN_PARAMS.user, userId);
    url.hash = ADMIN_TAB.users;
  } else {
    url.searchParams.delete(ADMIN_PARAMS.user);
  }

  return url;
};
