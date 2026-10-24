import { adminAnalyticsQuerySchema, adminAnalyticsSchema, adminOverviewSchema, adminSessionSchema } from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class AdminSessionDto extends createZodDto(adminSessionSchema) {}

export class AdminOverviewDto extends createZodDto(adminOverviewSchema) {}

export class AdminAnalyticsQueryDto extends createZodDto(adminAnalyticsQuerySchema) {}

export class AdminAnalyticsDto extends createZodDto(adminAnalyticsSchema) {}
