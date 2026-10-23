'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToastError } from '@/entities/app/locale';
import { setAdminNodeAvailability } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

export const useSetNodeAvailability = () => {
  const queryClient = useQueryClient();
  const toastError = useToastError();

  return useMutation({
    mutationFn: setAdminNodeAvailability,
    onError: toastError,
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin() })
  });
};
