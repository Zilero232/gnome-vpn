'use client';

import { useMutation } from '@tanstack/react-query';

import { useToastError } from '@/entities/app/locale';
import { getWireguardConfig } from '@/shared/api';

export const useWireguardFile = () => {
  const toastError = useToastError();

  return useMutation({ mutationFn: (id: string) => getWireguardConfig({ id }), onError: toastError });
};
