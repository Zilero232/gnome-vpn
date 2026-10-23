'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { redeemPromoCode } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useRedeemPromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: redeemPromoCode,
    onSuccess: () =>
      Promise.all(
        [QUERY_KEYS.referrals(), QUERY_KEYS.subscriptionStatus(), QUERY_KEYS.pendingDiscount(), QUERY_KEYS.gifts()].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey })
        )
      )
  });
};
