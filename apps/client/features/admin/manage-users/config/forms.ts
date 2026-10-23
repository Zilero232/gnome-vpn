import type { AdminExtendInput, AdminMessageInput } from '@gnomevpn/schemas';

export const EXTEND_FORM = {
  defaults: { days: 7 }
} as const satisfies { defaults: AdminExtendInput };

export const MESSAGE_FORM = {
  defaults: { text: '' }
} as const satisfies { defaults: AdminMessageInput };
