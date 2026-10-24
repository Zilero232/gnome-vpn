import type { PrismaService } from '@/core';
import type { XrayClient } from '@/lib/xray';
import type { ReconcilePeer } from '@/modules/scheduler/jobs/reconcile-peers/reconcile-peers.job.types';

export type CollectOrphansInput = {
  prisma: PrismaService;
  xray: XrayClient;
  nodeId: string;
  peers: ReconcilePeer[];
  nodeClients: Map<string, boolean>;
  online: Set<string> | null;
};

export type NamedOnNodeInput = {
  prisma: PrismaService;
  nodeId: string;
};
