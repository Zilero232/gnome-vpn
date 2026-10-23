import type { ConsentKind } from '@gnomevpn/schemas';

export type ConsentRow = {
  kind: ConsentKind;
  version: string;
  granted: boolean;
  createdAt: Date;
};
