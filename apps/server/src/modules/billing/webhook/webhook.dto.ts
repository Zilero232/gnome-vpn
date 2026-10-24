import { webhookEventSchema } from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class WebhookEventDto extends createZodDto(webhookEventSchema) {}
