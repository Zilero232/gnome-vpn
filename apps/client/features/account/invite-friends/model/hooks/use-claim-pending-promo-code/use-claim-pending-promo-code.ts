'use client';

import { formatGiftCode, promoCodeOrigin } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';
import { useEffect, useEffectEvent } from 'react';
import { toast } from 'sonner';

import { useErrorMessage } from '@/entities/app/locale';
import { useCurrentUser } from '@/entities/auth/user';
import { apiErrorCode } from '@/shared/api';
import { clearPendingPromoCode, readPendingPromoCode, storePendingPromoCode } from '@/shared/lib';

import type { ClaimInput } from './use-claim-pending-promo-code.types';

import { isFinalRefusal } from '../../../lib';
import { useRedeemPromoCode } from '../use-redeem-promo-code';
import { useRedeemedToast } from '../use-redeemed-toast';
import { GIFT_PROMPT } from './use-claim-pending-promo-code.constants';

export const useClaimPendingPromoCode = () => {
  const t = useTranslations('referrals');
  const errorMessage = useErrorMessage();
  const redeemedToast = useRedeemedToast();
  const { user } = useCurrentUser();
  const { mutateAsync } = useRedeemPromoCode();

  const isSignedIn = user !== null;

  const claim = ({ code, isAsked }: ClaimInput) => {
    clearPendingPromoCode();

    void mutateAsync({ code }).then(redeemedToast, (error: unknown) => {
      if (!isFinalRefusal(error)) {
        storePendingPromoCode(code);

        if (isAsked) {
          toast.error(errorMessage(error));
        }

        return;
      }

      if (apiErrorCode(error) !== 'REFERRAL_SELF') {
        toast.error(t('pendingRefused'), { description: errorMessage(error) });
      }
    });
  };

  const offer = useEffectEvent(() => {
    const code = readPendingPromoCode();

    if (!code) {
      return undefined;
    }

    if (promoCodeOrigin(code) !== 'gift') {
      claim({ code, isAsked: false });

      return undefined;
    }

    toast(t('giftPending.title'), {
      id: GIFT_PROMPT.toastId,
      description: t('giftPending.description', { code: formatGiftCode(code) }),
      duration: Number.POSITIVE_INFINITY,
      action: { label: t('giftPending.redeem'), onClick: () => claim({ code, isAsked: true }) },
      cancel: { label: t('giftPending.later'), onClick: clearPendingPromoCode }
    });

    return () => {
      toast.dismiss(GIFT_PROMPT.toastId);
    };
  });

  useEffect(() => {
    if (!isSignedIn) {
      return undefined;
    }

    return offer();
  }, [isSignedIn]);
};
