import type { IncyServerUriInput } from '../incy-uri.types';

import { serverName } from '../../server-name';
import { WIREGUARD_SCHEME } from './wireguard.constants';

export const wireguardUri = ({ config, country, countryCode, city }: IncyServerUriInput): string | null => {
  if (!config.wireguard) {
    return null;
  }

  const url = new URL(`${WIREGUARD_SCHEME}://${config.server}`);

  url.username = encodeURIComponent(config.auth);
  url.port = String(config.port);
  url.pathname = '/';

  url.searchParams.set('publickey', config.wireguard.publicKey);
  url.searchParams.set('address', config.wireguard.address);
  url.searchParams.set('mtu', String(config.wireguard.mtu));

  url.hash = serverName({ country, countryCode, city });

  return url.toString();
};
