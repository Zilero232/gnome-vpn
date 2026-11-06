import type { PeerNameInput } from '@/modules/peers';

export type OnlineCountInput = {
  peers: PeerNameInput[];
  online: Set<string>;
};
