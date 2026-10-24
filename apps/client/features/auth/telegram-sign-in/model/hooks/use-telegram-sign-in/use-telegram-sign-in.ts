import { useMutation } from '@tanstack/react-query';

import { authClient, redeemTelegramLogin, startSession } from '@/shared/api';

export const useTelegramSignIn = () => {
  const { refetch } = authClient.useSession();

  return useMutation({
    mutationFn: async (code: string) => {
      const { token } = await redeemTelegramLogin(code);

      startSession(token);
      await refetch();
    }
  });
};
