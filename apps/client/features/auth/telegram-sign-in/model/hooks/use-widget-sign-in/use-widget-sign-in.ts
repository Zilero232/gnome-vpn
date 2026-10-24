import { useMutation } from '@tanstack/react-query';

import { authClient, signInWithTelegram, startSession } from '@/shared/api';

export const useWidgetSignIn = () => {
  const { refetch } = authClient.useSession();

  return useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const { token } = await signInWithTelegram(payload);

      startSession(token);
      await refetch();
    }
  });
};
