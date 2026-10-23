'use client';

import type { ConsentState, UpdateMarketingConsentInput } from '@gnomevpn/schemas';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToastError } from '@/entities/app/locale';
import { updateMarketingConsent } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useUpdateMarketingConsent = () => {
  const queryClient = useQueryClient();
  const toastError = useToastError();

  const queryKey = QUERY_KEYS.consents();

  return useMutation({
    mutationKey: queryKey,
    mutationFn: updateMarketingConsent,
    onMutate: async ({ granted }: UpdateMarketingConsentInput) => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<ConsentState>(queryKey);

      queryClient.setQueryData<ConsentState>(queryKey, (current) => current && { ...current, marketing: { granted, at: new Date().toISOString() } });

      return { previous };
    },
    onError: (error, _input, snapshot) => {
      queryClient.setQueryData(queryKey, snapshot?.previous);

      toastError(error);
    },
    onSettled: () => queryClient.isMutating({ mutationKey: queryKey }) === 1 && queryClient.invalidateQueries({ queryKey })
  });
};
