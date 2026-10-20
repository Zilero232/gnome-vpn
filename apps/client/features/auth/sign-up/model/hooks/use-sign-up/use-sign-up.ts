import type { SignUpValues } from '@gnomevpn/schemas';

import { signUpSchema } from '@gnomevpn/schemas';
import { useMutation } from '@tanstack/react-query';

import { authClient, queryClient, unwrapAuth } from '@/shared/api';

import { nameFromEmail } from '../../../lib';

export type { SignUpValues };
export { signUpSchema };

export const useSignUp = () =>
  useMutation({
    mutationFn: async ({ email, password }: SignUpValues) => {
      const session = unwrapAuth({
        result: await authClient.signUp.email({ email, password, name: nameFromEmail(email) }),
        fallbackKey: 'errors.signUpFailed'
      });

      queryClient.clear();

      return session;
    }
  });
