import { connectionCheckSchema, connectionResultSchema, serverStatusSchema } from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class ServerStatusDto extends createZodDto(serverStatusSchema) {}

export class ConnectionCheckDto extends createZodDto(connectionCheckSchema) {}

export class ConnectionResultDto extends createZodDto(connectionResultSchema) {}
