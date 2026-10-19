import type { z } from 'zod';

import type {
  createWireguardConfigSchema,
  wireguardConfigFileSchema,
  wireguardConfigSchema,
  wireguardNodeSchema,
  wireguardOverviewSchema
} from './wireguard.schemas';

export type CreateWireguardConfigInput = z.infer<typeof createWireguardConfigSchema>;

export type WireguardNode = z.infer<typeof wireguardNodeSchema>;

export type WireguardConfig = z.infer<typeof wireguardConfigSchema>;

export type WireguardOverview = z.infer<typeof wireguardOverviewSchema>;

export type WireguardConfigFile = z.infer<typeof wireguardConfigFileSchema>;
