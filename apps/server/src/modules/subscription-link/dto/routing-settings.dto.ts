import { routingSettingsSchema, updateRoutingSettingsSchema } from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class RoutingSettingsDto extends createZodDto(routingSettingsSchema) {}

export class UpdateRoutingSettingsDto extends createZodDto(updateRoutingSettingsSchema) {}
