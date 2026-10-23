import { STORAGE_KEYS } from '@/shared/constants';
import { isServer } from '@/shared/lib';

import type { InvitePrompt, InvitePromptInput } from './invite-prompt.types';

import { INVITE_PROMPT } from './invite-prompt.constants';

export const invitePrompt = ({ status, now = Date.now() }: InvitePromptInput): InvitePrompt | null => {
  const payment = status?.lastPayment;

  if (!status || !payment || status.status !== 'active' || status.period !== 'paid') {
    return null;
  }

  const isOwnPurchase = payment.status === 'succeeded' && payment.kind === 'subscription' && !payment.isAutoCharge;
  const isRecent = now - Date.parse(payment.createdAt) < INVITE_PROMPT.windowMs;

  return isOwnPurchase && isRecent ? { key: payment.createdAt, plan: status.plan } : null;
};

export const readDismissedInvitePrompt = (): string | null => {
  if (isServer()) {
    return null;
  }

  try {
    return window.localStorage.getItem(STORAGE_KEYS.invitePromptDismissed);
  } catch {
    return null;
  }
};

export const dismissInvitePrompt = (key: string): void => {
  if (isServer()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEYS.invitePromptDismissed, key);
  } catch {}
};
