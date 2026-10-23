'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToastError } from '@/entities/app/locale';
import { QUERY_KEYS } from '@/shared/constants';

import type { UseUserActionInput } from './use-user-action.types';

export const useUserAction = <Input, Result>(action: UseUserActionInput<Input, Result>) => {
  const queryClient = useQueryClient();
  const toastError = useToastError();

  return useMutation({
    mutationFn: action,
    onError: toastError,
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin() })
  });
};
