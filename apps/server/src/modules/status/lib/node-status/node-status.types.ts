import type { ProtocolNode } from '../node-protocols';
import type { ProbeStamps } from '../node-state';
import type { UptimeRow } from '../uptime-history';

export type StatusNodeRow = ProtocolNode &
  ProbeStamps & {
    countryCode: string;
    uptime: UptimeRow[];
  };

export type NodeStatusInput = {
  node: StatusNodeRow;
  now: Date;
};
