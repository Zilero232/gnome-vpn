'use client';

import { useMount } from '@siberiacancode/reactuse';
import { useState } from 'react';

import { useSubscriptionStatus } from '@/entities/billing/subscription';

import { dismissInvitePrompt, invitePrompt, readDismissedInvitePrompt } from '../../../lib';

export const useInvitePrompt = () => {
  const { subscription } = useSubscriptionStatus();

  const [dismissed, setDismissed] = useState<string | null>();

  useMount(() => setDismissed(readDismissedInvitePrompt()));

  const prompt = invitePrompt({ status: subscription });
  const isVisible = prompt !== null && dismissed !== undefined && dismissed !== prompt.key;

  const dismiss = () => {
    if (!prompt) {
      return;
    }

    dismissInvitePrompt(prompt.key);
    setDismissed(prompt.key);
  };

  return { prompt: isVisible ? prompt : null, dismiss };
};
