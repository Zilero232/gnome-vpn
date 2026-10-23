'use client';

import { useEffect, useSyncExternalStore } from 'react';

import type { AdminNavigation } from '../../context';

import { userParamOf, withUserParam } from '../../../lib';
import { ADMIN_NAVIGATION } from './use-admin-navigation-state.constants';

const announceHash = () => window.dispatchEvent(new HashChangeEvent('hashchange'));

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  window.addEventListener(ADMIN_NAVIGATION.event, onChange);

  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(ADMIN_NAVIGATION.event, onChange);
  };
};

const readUserId = () => userParamOf(window.location.search);

const go = (userId: string | null) => {
  window.history.pushState(window.history.state, '', withUserParam({ href: window.location.href, userId }));
  window.dispatchEvent(new Event(ADMIN_NAVIGATION.event));
  announceHash();
};

export const useAdminNavigationState = (): AdminNavigation => {
  const userId = useSyncExternalStore(subscribe, readUserId, () => null);

  useEffect(() => {
    window.addEventListener('popstate', announceHash);

    return () => window.removeEventListener('popstate', announceHash);
  }, []);

  return {
    userId,
    openUser: (id: string) => go(id),
    closeUser: () => go(null)
  };
};
