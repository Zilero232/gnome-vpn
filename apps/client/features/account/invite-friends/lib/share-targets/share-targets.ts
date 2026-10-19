import type { ShareTarget, ShareTargetsInput } from './share-targets.types';

import { SHARE_ENDPOINT } from './share-targets.constants';

const withQuery = (endpoint: string, query: Record<string, string>): string => {
  const pairs = Object.entries(query).map(([key, value]) => `${key}=${encodeURIComponent(value)}`);

  return `${endpoint}?${pairs.join('&')}`;
};

export const shareTargets = ({ url, text, subject }: ShareTargetsInput): ShareTarget[] => [
  { key: 'telegram', href: withQuery(SHARE_ENDPOINT.telegram, { url, text }) },
  { key: 'whatsapp', href: withQuery(SHARE_ENDPOINT.whatsapp, { text: `${text} ${url}` }) },
  { key: 'vk', href: withQuery(SHARE_ENDPOINT.vk, { url, title: text }) },
  { key: 'email', href: withQuery(SHARE_ENDPOINT.email, { subject, body: `${text}\n\n${url}` }) }
];
