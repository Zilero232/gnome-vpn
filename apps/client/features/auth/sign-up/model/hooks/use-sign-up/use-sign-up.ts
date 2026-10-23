import { useMutation } from '@tanstack/react-query';

import { authClient, queryClient, unwrapAuth } from '@/shared/api';

import type { SignUpFormValues } from '../../../lib';

import { nameFromEmail } from '../../../lib';
import { recordSignUpConsents } from './use-sign-up.helpers';

export const useSignUp = () =>
  useMutation({
    mutationFn: async ({ email, password, isMarketingConsentGiven }: SignUpFormValues) => {
      const session = unwrapAuth({
        result: await authClient.signUp.email({ email, password, name: nameFromEmail(email) }),
        fallbackKey: 'errors.signUpFailed'
      });

      queryClient.clear();

      if (session) {
        await recordSignUpConsents({ userId: session.user.id, isMarketingConsentGiven });
      }

      return session;
    }
  });
