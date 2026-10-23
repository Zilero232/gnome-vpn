'use client';

import { createContext, use } from 'react';

import type { AdminNavigation } from './admin-navigation.types';

export const AdminNavigationContext = createContext<AdminNavigation | null>(null);

export const useAdminNavigation = () => {
  const navigation = use(AdminNavigationContext);

  if (!navigation) {
    throw new Error('useAdminNavigation must be used inside AdminNavigationContext');
  }

  return navigation;
};
