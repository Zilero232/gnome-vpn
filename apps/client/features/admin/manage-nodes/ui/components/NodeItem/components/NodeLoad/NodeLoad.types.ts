import type { AdminNode } from '@gnomevpn/schemas';

export type NodeLoadProps = {
  node: AdminNode;
};

export type LoadCell = {
  key: string;
  label: string;
  value: string;
  hint: string;
};
