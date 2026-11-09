import type { z } from 'zod';

import type { nodeConfigSchema, nodesConfigSchema, relayConfigSchema, relayRouteSchema } from './nodes-config.schema';

export type NodeConfig = z.infer<typeof nodeConfigSchema>;

export type RelayConfig = z.infer<typeof relayConfigSchema>;

export type RelayRoute = z.infer<typeof relayRouteSchema>;

export type ProvisionConfig = z.output<typeof nodesConfigSchema>;

export type SshTarget = Pick<NodeConfig, 'host' | 'sshPassword' | 'sshUser'>;

export type NodeConfigIssues = z.ZodError<ProvisionConfig>['issues'];
