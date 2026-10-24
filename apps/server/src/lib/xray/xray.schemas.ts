import { z } from 'zod';

const SETTINGS = z.union([z.string(), z.record(z.string(), z.unknown())]);

const RESOURCE_USAGE = z.object({
  current: z.number().nullish(),
  total: z.number().nullish()
});

const CLIENT = z.object({
  email: z.string().min(1),
  enable: z.boolean().optional()
});

export const PANEL_SCHEMA = {
  response: z.object({
    success: z.boolean(),
    msg: z.string().nullish(),
    obj: z.unknown()
  }),
  inbound: z.object({
    id: z.number(),
    enable: z.boolean(),
    remark: z.string(),
    port: z.number(),
    protocol: z.string(),
    settings: SETTINGS.optional(),
    streamSettings: SETTINGS.optional(),
    sniffing: SETTINGS.optional(),
    clientStats: z
      .array(
        z.object({
          email: z.string(),
          up: z.number().nullish(),
          down: z.number().nullish()
        })
      )
      .nullish()
  }),
  serverStatus: z.object({
    cpu: z.number().nullish(),
    mem: RESOURCE_USAGE.nullish(),
    tcpCount: z.number().nullish(),
    xray: z.object({ state: z.string().nullish() }).nullish()
  }),
  onlines: z.union([z.array(z.string()), z.record(z.string(), z.array(z.string()))]).nullish(),
  lastOnline: z.record(z.string(), z.number()).nullish(),
  settings: z.looseObject({
    clients: z.array(z.unknown()).nullish()
  })
} as const;

export const CLIENT_SCHEMA = {
  hysteria: CLIENT.extend({ auth: z.string() }),
  vless: CLIENT.extend({ id: z.string() }),
  wireguard: CLIENT.extend({
    privateKey: z.string().optional(),
    publicKey: z.string().optional(),
    allowedIPs: z.array(z.string()).optional(),
    limitIp: z.number().optional()
  })
} as const;
