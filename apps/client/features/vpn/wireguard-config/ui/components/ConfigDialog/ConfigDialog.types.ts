import type { WireguardConfigFile } from '@gnomevpn/schemas';

export type ConfigDialogProps = {
  file: WireguardConfigFile | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onOpenChangeComplete: (isOpen: boolean) => void;
};
