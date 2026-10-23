'use client';

import { formatGiftCode, promoCodeOrigin } from '@gnomevpn/schemas';
import { useMount } from '@siberiacancode/reactuse';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useErrorMessage } from '@/entities/app/locale';
import { apiErrorCode } from '@/shared/api';
import { clearPendingPromoCode, readPendingPromoCode, storePendingPromoCode } from '@/shared/lib';

import { isFinalRefusal } from '../../../lib';
import { useRedeemPromoCode } from '../use-redeem-promo-code';
import { useRedeemedToast } from '../use-redeemed-toast';

export const useClaimPendingPromoCode = () => {
  const t = useTranslations('referrals');
  const errorMessage = useErrorMessage();
  const redeemedToast = useRedeemedToast();
  const { mutate } = useRedeemPromoCode();

  useMount(() => {
    const code = readPendingPromoCode();

    if (!code) {
      return;
    }

    const claim = () => {
      clearPendingPromoCode();

      mutate(
        { code },
        {
          onSuccess: redeemedToast,
          onError: (error) => {
            if (!isFinalRefusal(error)) {
              storePendingPromoCode(code);

              return;
            }

            if (apiErrorCode(error) !== 'REFERRAL_SELF') {
              toast.error(t('pendingRefused'), { description: errorMessage(error) });
            }
          }
        }
      );
    };

    if (promoCodeOrigin(code) !== 'gift') {
      claim();

      return;
    }

    toast(t('giftPending.title'), {
      description: t('giftPending.description', { code: formatGiftCode(code) }),
      duration: Number.POSITIVE_INFINITY,
      action: { label: t('giftPending.redeem'), onClick: claim },
      cancel: { label: t('giftPending.later'), onClick: clearPendingPromoCode }
    });
  });
};
