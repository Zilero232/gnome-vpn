import type { SubscriptionStatus } from '@gnomevpn/schemas';

import { useQueryClient } from '@tanstack/react-query';

import { markCheckoutPending, statusFingerprint, useInvalidateSubscription } from '@/entities/billing/subscription';
import { QUERY_KEYS } from '@/shared/constants';

import type { SettlePaymentInput } from './use-settle-payment.types';

import { redirectToConfirmation } from '../../checkout.helpers';

export const useSettlePayment = () => {
  const queryClient = useQueryClient();
  const invalidateSubscription = useInvalidateSubscription();

  return async ({ confirmationUrl }: SettlePaymentInput): Promise<void> => {
    const status = queryClient.getQueryData<SubscriptionStatus>(QUERY_KEYS.subscriptionStatus());

    markCheckoutPending({ fingerprint: statusFingerprint(status) });

    if (redirectToConfirmation(confirmationUrl)) {
      return;
    }

    await invalidateSubscription();
  };
};
