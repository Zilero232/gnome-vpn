import type { AdminReferral } from '@gnomevpn/schemas';

export type InvitedTableProps = {
  invited: AdminReferral[];
  total: number;
};
