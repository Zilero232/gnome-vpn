import type { SHARE_ENDPOINT } from './share-targets.constants';

export type ShareTargetKey = keyof typeof SHARE_ENDPOINT;

export type ShareTargetsInput = {
  url: string;
  text: string;
  subject: string;
};

export type ShareTarget = {
  key: ShareTargetKey;
  href: string;
};
