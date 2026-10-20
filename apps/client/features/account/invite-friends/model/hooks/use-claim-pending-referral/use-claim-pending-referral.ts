'use client';

import { useMount } from '@siberiacancode/reactuse';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useErrorMessage } from '@/entities/app/locale';
import { apiErrorCode } from '@/shared/api';

import { clearPendingReferral, isFinalRefusal, readPendingReferral } from '../../../lib';
import { useClaimReferral } from '../use-claim-referral';

export const useClaimPendingReferral = () => {
  const t = useTranslations('referrals');
  const errorMessage = useErrorMessage();
  const { mutate } = useClaimReferral();

  useMount(() => {
    const code = readPendingReferral();

    if (!code) {
      return;
    }

    mutate(
      { code },
      {
        onSuccess: () => {
          clearPendingReferral();
          toast.success(t('claimed'));
        },
        onError: (error) => {
          if (!isFinalRefusal(error)) {
            return;
          }

          clearPendingReferral();

          if (apiErrorCode(error) !== 'REFERRAL_SELF') {
            toast.error(t('pendingRefused'), { description: errorMessage(error) });
          }
        }
      }
    );
  });
};
