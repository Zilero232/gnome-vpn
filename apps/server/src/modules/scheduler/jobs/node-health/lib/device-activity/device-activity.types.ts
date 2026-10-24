import type { PeerNameInput } from '@/modules/peers';

export type ActivityPeer = PeerNameInput & {
  deviceId: string | null;
};

export type DeviceActivityInput = {
  peers: ActivityPeer[];
  lastOnline: Map<string, Date>;
};
