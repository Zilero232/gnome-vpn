import type { AdminUserCard } from '@gnomevpn/schemas';

export type UserHeaderProps = {
  profile: AdminUserCard['profile'];
  access: NonNullable<AdminUserCard['subscription']>['access'];
};
