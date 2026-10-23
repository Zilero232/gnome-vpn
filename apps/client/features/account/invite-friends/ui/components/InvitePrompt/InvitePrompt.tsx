'use client';

import { useInvitePrompt } from '../../../model/hooks';
import { InvitePromptCard } from '../InvitePromptCard';

export const InvitePrompt = () => {
  const { prompt, dismiss } = useInvitePrompt();

  if (!prompt) {
    return null;
  }

  return <InvitePromptCard plan={prompt.plan} onDismiss={dismiss} />;
};
