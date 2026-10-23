import { Module } from '@nestjs/common';

import { ConnectionCheckService, NodeUptimeService, ServerStatusService } from './services';
import { StatusController } from './status.controller';

@Module({
  controllers: [StatusController],
  providers: [ConnectionCheckService, NodeUptimeService, ServerStatusService],
  exports: [NodeUptimeService]
})
export class StatusModule {}
