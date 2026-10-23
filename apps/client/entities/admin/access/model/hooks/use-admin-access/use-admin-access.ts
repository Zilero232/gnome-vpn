'use client';

import { useQuery } from '@tanstack/react-query';

import { authClient, getAdminSession, useHasSession } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

import { ADMIN_ACCESS } from './use-admin-access.constants';

export const useAdminAccess = () => {
  const { isPending: isSessionPending } = authClient.useSession();
  const hasSession = useHasSession();

  const {
    data: session,
    isPending,
    isSuccess
  } = useQuery({
    queryKey: QUERY_KEYS.adminSession(),
    queryFn: getAdminSession,
    enabled: hasSession,
    retry: false,
    staleTime: ADMIN_ACCESS.staleMs
  });

  const isResolving = isSessionPending || (hasSession && isPending);

  return {
    email: session?.email ?? '',
    isAdmin: isSuccess,
    isResolving,
    isDenied: !isResolving && !isSuccess
  };
};
