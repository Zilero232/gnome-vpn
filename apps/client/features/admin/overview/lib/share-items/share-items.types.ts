import type { AdminShare } from '@gnomevpn/schemas';

export type ShareLabels = {
  unknown: string;
  other: string;
};

export type ShareItemsInput = {
  shares: AdminShare[];
  labels: ShareLabels;
  nameOf?: (label: string) => string;
};

export type ShareItem = {
  key: string;
  label: string;
  value: number;
};
