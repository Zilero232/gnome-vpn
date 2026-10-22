'use client';

import { useMount } from '@siberiacancode/reactuse';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useErrorMessage } from '@/entities/app/locale';
import { apiErrorCode } from '@/shared/api';
import { clearPendingReferral, readPendingReferral, storePendingReferral } from '@/shared/lib';
import { celebrate } from '@/ui-kit';

import { isFinalRefusal } from '../../../lib';
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

    clearPendingReferral();

    mutate(
      { code },
      {
        onSuccess: () => celebrate(t('claimed')),
        onError: (error) => {
          if (!isFinalRefusal(error)) {
            storePendingReferral(code);

            return;
          }

          if (apiErrorCode(error) !== 'REFERRAL_SELF') {
            toast.error(t('pendingRefused'), { description: errorMessage(error) });
          }
        }
      }
    );
  });
};
