'use client';

import type { RoutingSettings, UpdateRoutingSettingsInput } from '@gnomevpn/schemas';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToastError } from '@/entities/app/locale';
import { updateRoutingSettings } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useUpdateRouting = () => {
  const queryClient = useQueryClient();
  const toastError = useToastError();

  const queryKey = QUERY_KEYS.routingSettings();

  return useMutation({
    mutationKey: queryKey,
    mutationFn: updateRoutingSettings,
    onMutate: async (patch: UpdateRoutingSettingsInput) => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<RoutingSettings>(queryKey);

      queryClient.setQueryData<RoutingSettings>(queryKey, (current) => current && { ...current, ...patch });

      return { previous };
    },
    onError: (error, _patch, snapshot) => {
      queryClient.setQueryData(queryKey, snapshot?.previous);

      toastError(error);
    },
    onSettled: () => queryClient.isMutating({ mutationKey: queryKey }) === 1 && queryClient.invalidateQueries({ queryKey })
  });
};
