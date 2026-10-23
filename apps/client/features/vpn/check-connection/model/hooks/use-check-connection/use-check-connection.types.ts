import type { ConnectionResult } from '@gnomevpn/schemas';

export type ConnectionVerdict = ConnectionResult & {
  ip: string;
};
