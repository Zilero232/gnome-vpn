'use client';

import type { MutationStatus } from '@tanstack/react-query';

import { useDidUpdate } from '@siberiacancode/reactuse';
import { useRef } from 'react';

export const useOutcomeFocus = (status: MutationStatus) => {
  const outcomeRef = useRef<HTMLDivElement>(null);

  useDidUpdate(() => {
    if (status === 'success' || status === 'error') {
      outcomeRef.current?.focus();
    }
  }, [status]);

  return outcomeRef;
};
