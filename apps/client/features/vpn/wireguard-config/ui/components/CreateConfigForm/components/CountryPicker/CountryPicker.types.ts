import type { WireguardNode } from '@gnomevpn/schemas';

export type CountryPickerProps = {
  nodes: WireguardNode[];
  selected: string;
  onSelect: (nodeId: string) => void;
};
