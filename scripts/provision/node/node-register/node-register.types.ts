import type { InstalledInbounds } from '../../inbound';
import type { PanelSession } from '../../remote';
import type { NodeConfig } from '../nodes-config';
import type { PrismaLike } from '../upsert-node';

export type RememberNodeSecretsInput = {
  serverEnvPath: string;
  countryCode: string;
  apiToken: string;
  panelPassword: string;
  panelPath: string;
};

export type RegisterNodeInput = {
  config: NodeConfig;
  prisma: PrismaLike;
  panel: PanelSession;
  auth: string;
  cert: InstalledInbounds;
};
