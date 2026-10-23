import { z } from 'zod';

import { tunnelProtocolSchema } from '../tunnel';
import { NODE_STATE, UPTIME_HISTORY } from './status.constants';

const uptimeSchema = z.number().min(0).max(1);

export const nodeStateSchema = z.enum(NODE_STATE);

export const uptimeDaySchema = z.object({
  date: z.iso.date(),
  uptime: uptimeSchema.nullable()
});

export const nodeStatusSchema = z.object({
  countryCode: z.string(),
  protocols: z.array(tunnelProtocolSchema),
  state: nodeStateSchema,
  checkedAt: z.string().nullable(),
  uptime: uptimeSchema.nullable(),
  days: z.array(uptimeDaySchema).length(UPTIME_HISTORY.days)
});

export const serverStatusSchema = z.object({
  nodes: z.array(nodeStatusSchema)
});

export const connectionCheckSchema = z.object({
  ip: z.union([z.ipv4(), z.ipv6()])
});

export const connectionResultSchema = z.object({
  viaGnome: z.boolean(),
  countryCode: z.string().optional()
});
