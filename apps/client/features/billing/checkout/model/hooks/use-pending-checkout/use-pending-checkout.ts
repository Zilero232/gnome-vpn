'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { clearCheckoutPending, pendingOutcome, readPendingCheckout, useSubscriptionStatus } from '@/entities/billing/subscription';
import { QUERY_KEYS } from '@/shared/constants';
import { celebrate } from '@/ui-kit';

export const usePendingCheckout = () => {
  const t = useTranslations('account.pending');
  const queryClient = useQueryClient();
  const { subscription, dataUpdatedAt } = useSubscriptionStatus();

  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const outcome = pendingOutcome({ pending: readPendingCheckout(), status: subscription });

    if (outcome === 'settled') {
      clearCheckoutPending();
      celebrate(t('settled'));
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingDiscount() });
    }

    if (outcome === 'cancelled') {
      clearCheckoutPending();
      toast.error(t('cancelled'));
    }

    setIsPending(outcome === 'pending');
  }, [subscription, dataUpdatedAt, t, queryClient]);

  const dismiss = () => {
    clearCheckoutPending();
    setIsPending(false);
  };

  return { isPending, dismiss };
};
