import { isNullish } from 'remeda';

import type { Prisma } from '@/generated';

import { AppServiceUnavailableException } from '@/common/exceptions';

import type { NodeAccess } from './xray.types';

import { XrayClient } from './xray';

export const NODE_ACCESS_SELECT = {
  apiUrl: true,
  apiTokenEnvVar: true
} as const satisfies Prisma.NodeSelect;

export const IDENTIFIED_NODE_SELECT = {
  id: true,
  ...NODE_ACCESS_SELECT
} as const satisfies Prisma.NodeSelect;

const resolveNodeApiKey = (ref: string): string => {
  const key = process.env[ref];

  if (isNullish(key)) {
    throw new AppServiceUnavailableException('NODE_UNAVAILABLE', `Missing ${ref} in the environment`);
  }

  return key;
};

export const xrayClientForNode = ({ apiUrl, apiTokenEnvVar }: NodeAccess): XrayClient =>
  new XrayClient({ baseUrl: apiUrl, token: resolveNodeApiKey(apiTokenEnvVar) });
