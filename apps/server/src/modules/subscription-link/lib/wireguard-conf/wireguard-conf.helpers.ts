import type { WireguardNode } from '@gnomevpn/schemas';

import { pick } from 'remeda';

import type { WireguardFileNameInput, WireguardNodeViewInput } from './wireguard-conf.types';

import { WIREGUARD_CONF } from './wireguard-conf.constants';

export const wireguardFileName = ({ countryCode, ordinal }: WireguardFileNameInput): string => {
  const country = countryCode.toUpperCase().replaceAll(/[^A-Z]/gu, '');
  const parts = [WIREGUARD_CONF.fileBrand, country, ordinal > 1 ? String(ordinal) : ''].filter(Boolean);

  return `${parts.join('-')}${WIREGUARD_CONF.fileExtension}`;
};

export const wireguardNodeView = ({ node, live }: WireguardNodeViewInput): WireguardNode => ({
  ...pick(node, ['id', 'country', 'countryCode']),
  isDown: !live.has(node.id)
});
