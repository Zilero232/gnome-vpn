'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { claimReferral } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useClaimReferral = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: claimReferral,
    onSuccess: (overview) => queryClient.setQueryData(QUERY_KEYS.referrals(), overview)
  });
};
