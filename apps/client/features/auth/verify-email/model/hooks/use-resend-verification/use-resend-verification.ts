'use client';

import { useMutation } from '@tanstack/react-query';

import { useLocale } from '@/entities/app/locale';
import { authClient, unwrapAuth } from '@/shared/api';
import { ROUTES } from '@/shared/constants';
import { localePath } from '@/shared/i18n';

export const useResendVerification = () => {
  const { locale } = useLocale();

  return useMutation({
    mutationFn: async (email: string) => {
      const callbackURL = localePath({ path: ROUTES.account, locale });

      unwrapAuth({ result: await authClient.sendVerificationEmail({ email, callbackURL }), fallbackKey: 'errors.verificationResendFailed' });
    }
  });
};
