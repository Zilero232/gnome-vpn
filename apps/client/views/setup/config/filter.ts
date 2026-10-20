import type { ClientPlatform } from '@gnomevpn/schemas';

import type { SETUP_PLATFORMS, WIREGUARD_SETUP_PLATFORMS } from './platforms';

export type SetupFilter = {
  downloads: readonly ClientPlatform[];
  incySteps: (typeof SETUP_PLATFORMS)[number];
  wireguard: readonly (typeof WIREGUARD_SETUP_PLATFORMS)[number][];
};

export const SETUP_PICKER = ['iphone', 'android', 'computer', 'tv'] as const;

export const SETUP_FILTER = {
  iphone: { downloads: ['ios'], incySteps: 'ios', wireguard: ['phone'] },
  android: { downloads: ['android'], incySteps: 'android', wireguard: ['phone'] },
  computer: { downloads: ['windows', 'macos', 'linux'], incySteps: 'desktop', wireguard: ['windows', 'other'] },
  tv: { downloads: ['tv'], incySteps: 'tv', wireguard: ['other'] }
} as const satisfies Record<(typeof SETUP_PICKER)[number], SetupFilter>;
