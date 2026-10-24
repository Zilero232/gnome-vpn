import type { Logger } from '@nestjs/common';

import type { PrismaService } from '@/core';
import type { XrayClient } from '@/lib/xray';
import type { ReconcilePeer } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.types';

export type ReleaseLegacyInput = {
  prisma: PrismaService;
  xray: XrayClient;
  logger: Logger;
  peers: ReconcilePeer[];
  nodeClients: Map<string, boolean>;
  online: Set<string> | null;
  now: Date;
};

export type IsLegacyPeerInput = {
  peer: ReconcilePeer;
  replaced: Set<string>;
};
