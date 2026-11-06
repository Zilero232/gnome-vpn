import type { Prisma } from '@/generated';

import { ROW_SELECT } from '../shared/admin.config';

export const ADMIN_NODE_SELECT = {
  ...ROW_SELECT.node,
  host: true,
  port: true,
  displayOrder: true
} as const satisfies Prisma.NodeSelect;

export const PEAK_ROW_SELECT = {
  day: true,
  clients: true,
  clientsAt: true,
  users: true,
  cpu: true,
  memory: true
} as const satisfies Prisma.NodePeakSelect;
