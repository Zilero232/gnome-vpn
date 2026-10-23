import { BlockList, isIPv6 } from 'node:net';
import { isNullish } from 'remeda';

import { canonicalIp } from '../../../../common/lib';
import { WEBHOOK_ALLOWED_CIDRS } from '../../config';

const buildBlockList = (): BlockList => {
  const list = new BlockList();

  for (const cidr of WEBHOOK_ALLOWED_CIDRS) {
    const [address, prefix] = cidr.split('/');
    const type = isIPv6(address) ? 'ipv6' : 'ipv4';

    list.addSubnet(address, Number(prefix), type);
  }

  return list;
};

const allowed = buildBlockList();

export const isAllowedWebhookIp = (raw: string): boolean => {
  const ip = canonicalIp(raw);

  if (isNullish(ip)) {
    return false;
  }

  return allowed.check(ip, isIPv6(ip) ? 'ipv6' : 'ipv4');
};
