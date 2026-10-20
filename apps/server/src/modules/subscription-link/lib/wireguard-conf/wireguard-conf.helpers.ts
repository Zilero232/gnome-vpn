import type { WireguardNode } from '@gnomevpn/schemas';

import slugify from '@sindresorhus/slugify';
import { pick } from 'remeda';

import type { WireguardFileNameInput, WireguardNodeViewInput } from './wireguard-conf.types';

import { WIREGUARD_CONF } from './wireguard-conf.constants';

export const wireguardFileName = ({ name, countryCode, deviceId }: WireguardFileNameInput): string => {
  const country = countryCode.toLowerCase().replaceAll(/[^a-z]/gu, '');
  const id = deviceId.replaceAll('-', '').slice(0, WIREGUARD_CONF.fileIdLength);
  const room = WIREGUARD_CONF.tunnelNameLength - country.length - id.length - 2;
  const base = slugify(name ?? '', { decamelize: false })
    .slice(0, room)
    .replace(/-+$/u, '');

  return `${base || WIREGUARD_CONF.filePrefix}-${id}-${country}${WIREGUARD_CONF.fileExtension}`;
};

export const wireguardNodeView = ({ node, live }: WireguardNodeViewInput): WireguardNode => ({
  ...pick(node, ['id', 'country', 'countryCode', 'city']),
  isDown: !live.has(node.id)
});
