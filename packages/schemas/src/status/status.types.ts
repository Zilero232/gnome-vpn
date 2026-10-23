import type { z } from 'zod';

import type {
  connectionCheckSchema,
  connectionResultSchema,
  nodeStateSchema,
  nodeStatusSchema,
  serverStatusSchema,
  uptimeDaySchema
} from './status.schemas';

export type NodeState = z.infer<typeof nodeStateSchema>;

export type UptimeDay = z.infer<typeof uptimeDaySchema>;

export type NodeStatus = z.infer<typeof nodeStatusSchema>;

export type ServerStatus = z.infer<typeof serverStatusSchema>;

export type ConnectionCheckInput = z.infer<typeof connectionCheckSchema>;

export type ConnectionResult = z.infer<typeof connectionResultSchema>;
