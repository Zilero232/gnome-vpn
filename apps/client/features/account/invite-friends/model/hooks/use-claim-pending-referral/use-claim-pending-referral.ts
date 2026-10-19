'use client';

import { useMount } from '@siberiacancode/reactuse';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { clearPendingReferral, isFinalRefusal, readPendingReferral } from '../../../lib';
import { useClaimReferral } from '../use-claim-referral';

export const useClaimPendingReferral = () => {
  const t = useTranslations('referrals');
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
          if (isFinalRefusal(error)) {
            clearPendingReferral();
          }
        }
      }
    );
  });
};
