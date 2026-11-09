import { PORTS } from '../../config';

export const RELAY = {
  table: 'gnomevpn_relay',
  rulesetPath: '/etc/gnomevpn/relay.nft',
  unitName: 'gnomevpn-relay.service',
  unitPath: '/etc/systemd/system/gnomevpn-relay.service',
  sysctlPath: '/etc/sysctl.d/99-gnomevpn-relay.conf',
  nftBinary: '/usr/sbin/nft',
  targetPort: PORTS.hysteria,
  protocols: ['tcp', 'udp']
} as const;
