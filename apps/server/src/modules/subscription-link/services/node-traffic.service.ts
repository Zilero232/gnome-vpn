import { Injectable } from '@nestjs/common';
import { sumBy } from 'remeda';

import type { NodeTraffic } from '@/lib/xray';

import { NO_TRAFFIC } from '@/lib/xray';

import type { RecordNodeTrafficInput, TrafficClient } from '../subscription-link.service.types';

@Injectable()
export class NodeTrafficService {
  private readonly byNode = new Map<string, Map<string, NodeTraffic>>();

  record({ nodeId, traffic }: RecordNodeTrafficInput): void {
    this.byNode.set(nodeId, traffic);
  }

  keepOnly(nodeIds: Set<string>): void {
    for (const nodeId of this.byNode.keys()) {
      if (!nodeIds.has(nodeId)) {
        this.byNode.delete(nodeId);
      }
    }
  }

  sum(clients: TrafficClient[]): NodeTraffic {
    const parts = clients.map(({ nodeId, email }) => this.byNode.get(nodeId)?.get(email) ?? NO_TRAFFIC);

    return { up: sumBy(parts, (part) => part.up), down: sumBy(parts, (part) => part.down) };
  }
}
