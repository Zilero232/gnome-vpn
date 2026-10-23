import type { AdminUserFilter } from '@gnomevpn/schemas';

export type UserFilterWhereInput = {
  filter: AdminUserFilter;
  now: Date;
  trialUserIds: string[];
};
