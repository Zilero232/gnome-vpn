'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createWireguardConfig } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useCreateWireguardConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWireguardConfig,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wireguard() }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.devices() })
      ])
  });
};
