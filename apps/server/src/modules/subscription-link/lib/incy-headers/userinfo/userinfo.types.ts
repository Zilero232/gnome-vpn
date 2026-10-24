import type { NodeTraffic } from '@/lib/xray';

export type UserinfoInput = {
  currentPeriodEnd: Date | null;
  traffic: NodeTraffic;
};
