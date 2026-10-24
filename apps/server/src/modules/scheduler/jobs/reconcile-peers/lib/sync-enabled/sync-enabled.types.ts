import type { XrayClient } from '@/lib/xray';
import type { ReconcilePeer } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.types';

export type SyncEnabledInput = {
  xray: XrayClient;
  peers: ReconcilePeer[];
  nodeClients: Map<string, boolean>;
};
