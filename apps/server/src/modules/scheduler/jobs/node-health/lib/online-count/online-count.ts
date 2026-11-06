import type { OnlineTally } from '@/modules/status';

import { peerClientName } from '@/modules/peers';

import type { OnlineCountInput } from './online-count.types';

export const onlineCount = ({ peers, online }: OnlineCountInput): OnlineTally => {
  const users = new Set(peers.filter((peer) => online.has(peerClientName(peer))).map((peer) => peer.userId));

  return { clients: online.size, users: users.size };
};
