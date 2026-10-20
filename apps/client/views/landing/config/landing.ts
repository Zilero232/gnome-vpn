import { AppWindow, EyeOff, Link2, MonitorSmartphone, Waypoints } from 'lucide-react';

export const HERO_FACTS = ['price', 'devices'] as const;

export const CONNECT_GUIDES = {
  ios: 'ios',
  android: 'android',
  windows: 'desktop',
  macos: 'desktop',
  linux: 'desktop',
  tv: 'tv'
} as const;

export const CONNECT_STEPS = ['install', 'copyLink', 'import'] as const;

export const INSIDE_POINTS = [
  { key: 'protocol', icon: Waypoints },
  { key: 'noLogs', icon: EyeOff },
  { key: 'devices', icon: MonitorSmartphone },
  { key: 'platforms', icon: AppWindow },
  { key: 'openFormat', icon: Link2 }
] as const;

export { SERVER_LOCATIONS as LOCATIONS } from '@/entities/app/protocols';

export const NOTE_PARAGRAPHS = ['why', 'cancel', 'refund'] as const;
