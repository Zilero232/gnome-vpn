import type { AdminNode, AdminNodePeak } from '@gnomevpn/schemas';

import { UPTIME_HISTORY } from '@gnomevpn/schemas';
import { indexBy } from 'remeda';

import { dayKey, dayKeys, utcDay } from '@/common/lib';
import { historyStart, nodeStatus } from '@/modules/status';

import type { NodeViewInput, PeakHistoryInput } from './nodes.types';

import { isoOrNull } from '../shared/listing.helpers';
import { nodeOnline } from '../shared/node-online.helpers';

export const peakHistory = ({ rows, today }: PeakHistoryInput): AdminNodePeak[] => {
  const byDay = indexBy(rows, (row) => dayKey(row.day));

  return dayKeys({ start: historyStart(today), days: UPTIME_HISTORY.days }).map((date) => {
    const row = byDay[date];

    return {
      date,
      clients: row?.clients ?? null,
      clientsAt: isoOrNull(row?.clientsAt),
      users: row?.users ?? null,
      cpu: row?.cpu ?? null,
      memory: row?.memory ?? null
    };
  });
};

export const nodeView = ({ node, now }: NodeViewInput): AdminNode => {
  const status = nodeStatus({ node, now });

  return {
    ...status,
    id: node.id,
    country: node.country,
    city: node.city,
    host: node.host,
    port: node.port,
    isAvailable: node.isAvailable,
    isOverloaded: node.isOverloaded,
    displayOrder: node.displayOrder,
    lastHealthyAt: isoOrNull(node.lastHealthyAt),
    createdAt: node.createdAt.toISOString(),
    online: nodeOnline({ node, state: status.state }),
    peaks: peakHistory({ rows: node.peaks, today: utcDay(now) })
  };
};
