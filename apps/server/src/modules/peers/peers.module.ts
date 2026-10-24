import { Module } from '@nestjs/common';

import { NodeTrafficService } from './services/node-traffic.service';
import { PeersService } from './services/peers.service';

@Module({
  providers: [PeersService, NodeTrafficService],
  exports: [PeersService, NodeTrafficService]
})
export class PeersModule {}
