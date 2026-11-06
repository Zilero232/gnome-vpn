import type { SshClient } from '@gnomevpn/scripts/ssh';

export type ConfigureFirewallInput = {
  ssh: SshClient;
  panelSources: string[];
};
