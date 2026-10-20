import type { WireguardConfig } from '@gnomevpn/schemas';

export type ConfigRowProps = {
  config: WireguardConfig;
  isBusy: boolean;
  onDownload: () => void;
  onQr: () => void;
  onRemove: () => void;
};
