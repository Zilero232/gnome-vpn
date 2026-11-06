import { PORTS } from '../../config';

export const FIREWALL = {
  sshPort: 22,
  tunnelRules: [`${PORTS.reality}/tcp`, `${PORTS.hysteria}/udp`, `${PORTS.wireguard}/udp`],
  backupGlob: '/etc/ufw/*.rules.2*',
  productionHostEnv: 'PROVISION_SSH_HOST',
  clientAddressCommand: 'echo "$SSH_CLIENT" | cut -d " " -f 1'
} as const;
