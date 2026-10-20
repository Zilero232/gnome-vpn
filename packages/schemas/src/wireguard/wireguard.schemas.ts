import { z } from 'zod';

import { WIREGUARD_CONFIG_NAME } from './wireguard.constants';

export const createWireguardConfigSchema = z.object({
  nodeId: z.uuid('validation.required'),
  name: z
    .string()
    .trim()
    .min(WIREGUARD_CONFIG_NAME.minLength, 'validation.required')
    .max(WIREGUARD_CONFIG_NAME.maxLength, 'validation.wireguardNameMax')
});

export const wireguardNodeSchema = z.object({
  id: z.string(),
  country: z.string(),
  countryCode: z.string(),
  city: z.string().nullable(),
  isDown: z.boolean()
});

export const wireguardConfigSchema = z.object({
  deviceId: z.string(),
  name: z.string(),
  node: wireguardNodeSchema,
  createdAt: z.string()
});

export const wireguardOverviewSchema = z.object({
  nodes: z.array(wireguardNodeSchema),
  configs: z.array(wireguardConfigSchema),
  deviceCount: z.number().int().nonnegative(),
  deviceLimit: z.number().int().nonnegative()
});

export const wireguardConfigFileSchema = z.object({
  deviceId: z.string(),
  filename: z.string(),
  conf: z.string()
});
