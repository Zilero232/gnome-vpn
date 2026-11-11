import { Module } from '@nestjs/common';

import { ConnectionCheckService } from './services/connection-check.service';
import { NodePeakService } from './services/node-peak.service';
import { NodeProbeService } from './services/node-probe.service';
import { NodeUptimeService } from './services/node-uptime.service';
import { ServerStatusService } from './services/server-status.service';
import { StatusController } from './status.controller';

@Module({
  controllers: [StatusController],
  providers: [ConnectionCheckService, NodePeakService, NodeProbeService, NodeUptimeService, ServerStatusService],
  exports: [NodePeakService, NodeProbeService, NodeUptimeService]
})
export class StatusModule {}
