'use client';

import { useMutation } from '@tanstack/react-query';

import { checkConnection, getPublicIp } from '@/shared/api';

import type { ConnectionVerdict } from './use-check-connection.types';

export const useCheckConnection = () =>
  useMutation({
    mutationFn: async (): Promise<ConnectionVerdict> => {
      const { ip } = await getPublicIp();
      const result = await checkConnection({ ip });

      return { ip, ...result };
    }
  });
