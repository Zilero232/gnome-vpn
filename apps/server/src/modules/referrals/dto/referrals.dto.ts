import { claimReferralSchema, referralOverviewSchema } from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class ReferralOverviewDto extends createZodDto(referralOverviewSchema) {}

export class ClaimReferralDto extends createZodDto(claimReferralSchema) {}
