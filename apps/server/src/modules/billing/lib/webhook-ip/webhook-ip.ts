import ipaddr from 'ipaddr.js';
import { BlockList, isIPv6 } from 'node:net';
import { isNullish } from 'remeda';

import { canonicalIp } from '@/common/lib';
import { WEBHOOK_ALLOWED_CIDRS } from '@/modules/billing/config';

const buildBlockList = (): BlockList => {
  const list = new BlockList();

  for (const cidr of WEBHOOK_ALLOWED_CIDRS) {
    const [address, prefix] = ipaddr.parseCIDR(cidr);

    list.addSubnet(address.toString(), prefix, address.kind());
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
