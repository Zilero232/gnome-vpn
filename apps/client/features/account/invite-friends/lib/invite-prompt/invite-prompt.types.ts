import type { PlanId, SubscriptionStatus } from '@gnomevpn/schemas';

export type InvitePrompt = {
  key: string;
  plan: PlanId;
};

export type InvitePromptInput = {
  status: SubscriptionStatus | null;
  now?: number;
};
