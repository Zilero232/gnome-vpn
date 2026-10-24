import type { Logger } from '@nestjs/common';

import type { XrayClient } from '@/lib/xray';
import type { ReconcilePeer } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.types';

export type DeleteNodeClientsInput = {
  xray: XrayClient;
  logger: Logger;
  peers: ReconcilePeer[];
  nodeClients: Map<string, boolean>;
};

export type PeersGoneInput = {
  peers: ReconcilePeer[];
  nodeClients: Map<string, boolean>;
};
