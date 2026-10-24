import { isNullish } from 'remeda';

import { AppServiceUnavailableException } from '@/common/exceptions';

import type { NodeAccess } from './xray.types';

import { XrayClient } from './xray';

const resolveNodeApiKey = (ref: string): string => {
  const key = process.env[ref];

  if (isNullish(key)) {
    throw new AppServiceUnavailableException('NODE_UNAVAILABLE', `Missing ${ref} in the environment`);
  }

  return key;
};

export const xrayClientForNode = ({ apiUrl, apiTokenEnvVar }: NodeAccess): XrayClient =>
  new XrayClient({ baseUrl: apiUrl, token: resolveNodeApiKey(apiTokenEnvVar) });
