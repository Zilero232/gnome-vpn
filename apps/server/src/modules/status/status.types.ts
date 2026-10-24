import type { Prisma } from '@/generated';

import type { ADDRESS_NODE_SELECT } from './config';

export type RecordUptimeInput = {
  checkedAt: Date;
  nodeIds: string[];
};

export type AddressNodeRow = Prisma.NodeGetPayload<{ select: typeof ADDRESS_NODE_SELECT }>;

export type NodeLookup = {
  countryCode: string;
  addresses: string[];
};

export type NodeAddress = {
  address: string;
  countryCode: string;
};

export type CountryForIpInput = {
  addresses: NodeAddress[];
  ip: string;
};
