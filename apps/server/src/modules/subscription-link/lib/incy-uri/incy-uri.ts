import { TUNNEL_PROTOCOL } from '@gnomevpn/schemas';
import { match } from 'ts-pattern';

import type { IncyServerUriInput } from './incy-uri.types';

import { hysteria2Uri } from './hysteria2';
import { vlessUri } from './vless';
import { wireguardUri } from './wireguard';

export const incyServerUri = (input: IncyServerUriInput): string | null =>
  match(input.config.protocol)
    .with(TUNNEL_PROTOCOL.vless, () => vlessUri(input))
    .with(TUNNEL_PROTOCOL.wireguard, () => wireguardUri(input))
    .otherwise(() => hysteria2Uri(input));
