import type { WireguardConfigFile, WireguardNode } from '@gnomevpn/schemas';

export type CreateConfigFormProps = {
  nodes: WireguardNode[];
  isFull: boolean;
  onCreated: (file: WireguardConfigFile) => void;
};
