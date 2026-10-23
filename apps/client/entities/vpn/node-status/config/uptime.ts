export const UPTIME_BANDS = {
  good: 0.99,
  fair: 0.95
} as const;

export const UPTIME_TONE = {
  good: 'good',
  fair: 'fair',
  poor: 'poor',
  none: 'none'
} as const;

export type UptimeTone = (typeof UPTIME_TONE)[keyof typeof UPTIME_TONE];
