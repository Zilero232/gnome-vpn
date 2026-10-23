import type { AdminUserCard } from '@gnomevpn/schemas';

export type LinkSectionProps = {
  userId: string;
  link: AdminUserCard['link'];
};
