export const SETUP_PLATFORMS = ['ios', 'android', 'desktop', 'tv'] as const;

export const SETUP_STEPS = ['install', 'copyLink', 'import', 'connect'] as const;

export const WIREGUARD_SETUP_PLATFORMS = ['windows', 'phone', 'other'] as const;

export const WIREGUARD_SETUP_STEPS = ['create', 'install', 'import', 'connect'] as const;

export type SetupPlatform = (typeof SETUP_PLATFORMS)[number];
