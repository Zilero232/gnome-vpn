import type { PlanId } from '@gnomevpn/schemas';

export type InvitePromptCardProps = {
  plan: PlanId;
  onDismiss: () => void;
};
