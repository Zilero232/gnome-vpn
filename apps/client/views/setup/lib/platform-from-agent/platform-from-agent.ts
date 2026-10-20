import type { SetupPick } from './platform-from-agent.types';

export const platformFromAgent = (userAgent: string): SetupPick => {
  if (/iphone|ipad|ipod/iu.test(userAgent)) {
    return 'iphone';
  }

  if (/android/iu.test(userAgent)) {
    return /\btv\b|aft|bravia|smart-?tv/iu.test(userAgent) ? 'tv' : 'android';
  }

  return /smart-?tv|tizen|webos|appletv/iu.test(userAgent) ? 'tv' : 'computer';
};
