'use client';

import type { ConsentState } from '@gnomevpn/schemas';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useEffectEvent } from 'react';

import { useCurrentUser } from '@/entities/auth/user';
import { recordPersonalDataConsent } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';
import { clearPendingConsent, logger, readPendingConsent } from '@/shared/lib';

import { useConsents } from '../use-consents';

export const useRecordPendingConsent = () => {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const { data: consents } = useConsents();

  const recordConsent = useMutation({
    mutationFn: recordPersonalDataConsent,
    onSuccess: (state) => {
      clearPendingConsent();
      queryClient.setQueryData<ConsentState>(QUERY_KEYS.consents(), state);
    },
    onError: (error) => logger.warn('pending personal data consent not recorded', { error })
  });

  const userId = user?.id ?? null;
  const isRecorded = consents ? consents.personalData !== null : null;

  const recordPending = useEffectEvent(() => {
    const pending = readPendingConsent();

    if (!pending || pending.userId !== userId) {
      return;
    }

    if (isRecorded) {
      clearPendingConsent();

      return;
    }

    recordConsent.mutate({ version: pending.version, source: 'signup' });
  });

  useEffect(() => {
    if (userId !== null && isRecorded !== null) {
      recordPending();
    }
  }, [userId, isRecorded]);
};
