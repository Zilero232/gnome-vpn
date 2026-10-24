import { Module } from '@nestjs/common';

import { DevicesController } from './devices.controller';
import { DeviceLimitService } from './services/device-limit.service';
import { DevicesService } from './services/devices.service';

@Module({
  controllers: [DevicesController],
  providers: [DevicesService, DeviceLimitService],
  exports: [DevicesService, DeviceLimitService]
})
export class DevicesModule {}
