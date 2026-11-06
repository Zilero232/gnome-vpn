import type { AdminNodeOnline } from '@gnomevpn/schemas';

import { NODE_STATE } from '@gnomevpn/schemas';
import { isNullish } from 'remeda';

import type { NodeOnlineInput } from './admin.types';

export const nodeOnline = ({ node, state }: NodeOnlineInput): AdminNodeOnline | null => {
  const { isAvailable, onlineClients, onlineUsers } = node;

  if (!isAvailable || state === NODE_STATE.down || isNullish(onlineClients) || isNullish(onlineUsers)) {
    return null;
  }

  return { clients: onlineClients, users: onlineUsers };
};
