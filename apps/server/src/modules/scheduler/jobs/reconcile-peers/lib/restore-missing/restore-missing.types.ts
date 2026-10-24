import type { Logger } from '@nestjs/common';

import type { PrismaService } from '@/core';
import type { XrayClient } from '@/lib/xray';
import type { ReconcileNode, ReconcilePeer } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.types';

export type RestoreMissingInput = {
  prisma: PrismaService;
  logger: Logger;
  xray: XrayClient;
  node: ReconcileNode;
  peers: ReconcilePeer[];
  nodeClients: Map<string, boolean>;
};
