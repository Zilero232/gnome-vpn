import type { Logger } from '@nestjs/common';

import type { PrismaService } from '../../../../../../core';
import type { XrayClient } from '../../../../../../lib';
import type { ReconcilePeer } from '../../reconcile-peers.job.types';

export type ReleaseRevokedInput = {
  prisma: PrismaService;
  xray: XrayClient;
  logger: Logger;
  peers: ReconcilePeer[];
  nodeClients: Map<string, boolean>;
};

export type StillRevokedInput = {
  prisma: PrismaService;
  peers: ReconcilePeer[];
};
