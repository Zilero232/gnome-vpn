import type { AdminNode } from '@gnomevpn/schemas';

export type NodeItemProps = {
  node: AdminNode;
  name: string;
  isToggling: boolean;
  onToggle: () => void;
};
