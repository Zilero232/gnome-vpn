import { Module } from '@nestjs/common';

import { ConnectionCheckService } from './services/connection-check.service';
import { NodeUptimeService } from './services/node-uptime.service';
import { ServerStatusService } from './services/server-status.service';
import { StatusController } from './status.controller';

@Module({
  controllers: [StatusController],
  providers: [ConnectionCheckService, NodeUptimeService, ServerStatusService],
  exports: [NodeUptimeService]
})
export class StatusModule {}
