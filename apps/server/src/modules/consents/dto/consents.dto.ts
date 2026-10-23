import {
  consentStateSchema,
  recordPersonalDataConsentSchema,
  unsubscribeQuerySchema,
  unsubscribeResultSchema,
  updateMarketingConsentSchema
} from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class ConsentStateDto extends createZodDto(consentStateSchema) {}

export class UpdateMarketingConsentDto extends createZodDto(updateMarketingConsentSchema) {}

export class RecordPersonalDataConsentDto extends createZodDto(recordPersonalDataConsentSchema) {}

export class UnsubscribeQueryDto extends createZodDto(unsubscribeQuerySchema) {}

export class UnsubscribeResultDto extends createZodDto(unsubscribeResultSchema) {}
