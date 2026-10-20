import type { HWID_HINT } from './announcement.constants';

export type HwidHint = (typeof HWID_HINT)[keyof typeof HWID_HINT];

export type AnnouncementNode = {
  country: string;
  createdAt: Date;
  lastHealthyAt: Date | null;
};

export type NodeMomentInput = {
  node: AnnouncementNode;
  now: Date;
};

export type AnnouncementInput = {
  currentPeriodEnd: Date | null;
  hasSubscription: boolean;
  nodes: AnnouncementNode[];
  blockedAtLimit?: number | null;
  hwidHint?: HwidHint | null;
  isPreparing?: boolean;
  now?: Date;
};

export type HwidHintInput = {
  needsHwid: boolean;
  isKeyless: boolean;
  deviceId: string | null;
};
