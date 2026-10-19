import { isNonNullish } from 'remeda';

import type { ClientFetchInput } from './client-fetch.types';

import { DEVICE_HEADER, headerOf } from '../../../devices';
import { NON_CLIENT } from './client-fetch.constants';

export const isClientFetch = ({ headers, hwid }: ClientFetchInput): boolean => {
  if (isNonNullish(hwid)) {
    return true;
  }

  const userAgent = headerOf({ headers, name: DEVICE_HEADER.userAgent }) ?? '';
  const accept = headerOf({ headers, name: NON_CLIENT.acceptHeader }) ?? '';

  if (NON_CLIENT.previewAgent.test(userAgent)) {
    return false;
  }

  return !(NON_CLIENT.browserAgent.test(userAgent) && accept.includes(NON_CLIENT.htmlAccept));
};
