import type { WireguardConfig, WireguardConfigFile } from '@gnomevpn/schemas';

export type ConfigListProps = {
  configs: WireguardConfig[];
  onShow: (file: WireguardConfigFile) => void;
};
