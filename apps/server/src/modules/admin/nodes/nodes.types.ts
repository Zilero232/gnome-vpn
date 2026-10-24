import type { Prisma } from '@/generated';
import type { UPTIME_ROW_SELECT } from '@/modules/status';

import type { CurrentAdminUser } from '../shared/admin.types';
import type { ADMIN_NODE_SELECT } from './nodes.config';

export type AdminNodeRow = Prisma.NodeGetPayload<{ select: typeof ADMIN_NODE_SELECT & { uptime: { select: typeof UPTIME_ROW_SELECT } } }>;

export type NodeViewInput = {
  node: AdminNodeRow;
  now: Date;
};

export type SetAvailabilityInput = {
  admin: CurrentAdminUser;
  nodeId: string;
  isAvailable: boolean;
};
