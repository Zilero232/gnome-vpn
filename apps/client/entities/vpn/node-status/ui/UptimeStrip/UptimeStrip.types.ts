import type { NodeStatus } from '@gnomevpn/schemas';

export type UptimeStripProps = Pick<NodeStatus, 'days' | 'uptime'> & {
  className?: string;
};
