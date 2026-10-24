import type { NodeTraffic } from '@/lib/xray';

export type IncyHeadersInput = {
  currentPeriodEnd: Date | null;
  traffic: NodeTraffic;
  clientUrl: string;
  supportUrl: string | null;
  announce: string | null;
};

export type IncyHeaders = Record<string, string>;
