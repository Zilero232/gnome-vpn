'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { isNumber, isPlainObject } from 'remeda';

import { ADMIN_TAB } from '@/shared/constants';

import type { AdminNavigation } from '../../context';

import { userParamOf, withUserParam } from '../../../lib';
import { ADMIN_NAVIGATION } from './use-admin-navigation-state.constants';

const announceHash = () => window.dispatchEvent(new HashChangeEvent('hashchange'));

const announce = () => {
  window.dispatchEvent(new Event(ADMIN_NAVIGATION.event));
  announceHash();
};

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  window.addEventListener(ADMIN_NAVIGATION.event, onChange);

  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(ADMIN_NAVIGATION.event, onChange);
  };
};

const readUserId = () => userParamOf(window.location.search);

const openedDepth = (): number => {
  const state: unknown = window.history.state;
  const depth = isPlainObject(state) ? state[ADMIN_NAVIGATION.depthKey] : undefined;

  return isNumber(depth) ? depth : 0;
};

const depthAfterOpen = (): number => {
  if (readUserId() === null) {
    return window.location.hash === `#${ADMIN_TAB.users}` ? 1 : 0;
  }

  const depth = openedDepth();

  return depth > 0 ? depth + 1 : 0;
};

const openUser = (userId: string) => {
  const state: unknown = window.history.state;

  window.history.pushState(
    { ...(isPlainObject(state) && state), [ADMIN_NAVIGATION.depthKey]: depthAfterOpen() },
    '',
    withUserParam({ href: window.location.href, userId })
  );

  announce();
};

const closeUser = () => {
  const depth = openedDepth();

  if (depth > 0) {
    window.history.go(-depth);

    return;
  }

  window.history.replaceState(window.history.state, '', withUserParam({ href: window.location.href, userId: null }));
  announce();
};

export const useAdminNavigationState = (): AdminNavigation => {
  const userId = useSyncExternalStore(subscribe, readUserId, () => null);

  useEffect(() => {
    window.addEventListener('popstate', announceHash);

    return () => window.removeEventListener('popstate', announceHash);
  }, []);

  return { userId, openUser, closeUser };
};
