import { createWireguardConfigSchema, deviceIdParamSchema, wireguardConfigFileSchema, wireguardOverviewSchema } from '@gnomevpn/schemas';
import { createZodDto } from 'nestjs-zod';

export class WireguardOverviewDto extends createZodDto(wireguardOverviewSchema) {}

export class CreateWireguardConfigDto extends createZodDto(createWireguardConfigSchema) {}

export class WireguardConfigFileDto extends createZodDto(wireguardConfigFileSchema) {}

export class WireguardConfigParamDto extends createZodDto(deviceIdParamSchema) {}
