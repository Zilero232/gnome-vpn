'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { clearCheckoutPending, pendingOutcome, readPendingCheckout, useSubscriptionStatus } from '@/entities/billing/subscription';
import { celebrate } from '@/ui-kit';

export const usePendingCheckout = () => {
  const t = useTranslations('account.pending');
  const { subscription, dataUpdatedAt } = useSubscriptionStatus();

  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const outcome = pendingOutcome({ pending: readPendingCheckout(), status: subscription });

    if (outcome === 'settled') {
      clearCheckoutPending();
      celebrate(t('settled'));
    }

    if (outcome === 'cancelled') {
      clearCheckoutPending();
      toast.error(t('cancelled'));
    }

    setIsPending(outcome === 'pending');
  }, [subscription, dataUpdatedAt, t]);

  const dismiss = () => {
    clearCheckoutPending();
    setIsPending(false);
  };

  return { isPending, dismiss };
};
