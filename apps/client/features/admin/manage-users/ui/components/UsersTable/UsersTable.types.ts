import type { AdminUser } from '@gnomevpn/schemas';

export type UsersTableProps = {
  users: AdminUser[];
  isFaded: boolean;
};
