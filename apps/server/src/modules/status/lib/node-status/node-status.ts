import type { NodeStatus } from '@gnomevpn/schemas';

import type { NodeStatusInput } from './node-status.types';

import { utcDay } from '../../../../common/lib';
import { nodeProtocols } from '../node-protocols';
import { nodeState } from '../node-state';
import { uptimeHistory } from '../uptime-history';

export const nodeStatus = ({ node, now }: NodeStatusInput): NodeStatus => ({
  countryCode: node.countryCode,
  protocols: nodeProtocols(node),
  state: nodeState(node),
  checkedAt: node.lastCheckedAt?.toISOString() ?? null,
  ...uptimeHistory({ rows: node.uptime, today: utcDay(now) })
});
