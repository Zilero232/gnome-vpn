import { referralOverviewSchema } from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class ReferralOverviewDto extends createZodDto(referralOverviewSchema) {}
