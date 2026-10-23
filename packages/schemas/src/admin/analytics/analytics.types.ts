import type { z } from 'zod';

import type {
  adminAnalyticsQuerySchema,
  adminAnalyticsRangeSchema,
  adminAnalyticsSchema,
  adminDaySchema,
  adminTopReferrerSchema
} from './analytics.schemas';

export type AdminAnalyticsRange = z.infer<typeof adminAnalyticsRangeSchema>;

export type AdminAnalyticsQuery = z.input<typeof adminAnalyticsQuerySchema>;

export type AdminDay = z.infer<typeof adminDaySchema>;

export type AdminTopReferrer = z.infer<typeof adminTopReferrerSchema>;

export type AdminAnalytics = z.infer<typeof adminAnalyticsSchema>;
