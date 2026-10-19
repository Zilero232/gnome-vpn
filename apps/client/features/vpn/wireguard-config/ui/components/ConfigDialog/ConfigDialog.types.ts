import type { WireguardConfigFile } from '@gnomevpn/schemas';

export type ConfigDialogProps = {
  file: WireguardConfigFile | null;
  onClose: () => void;
};
