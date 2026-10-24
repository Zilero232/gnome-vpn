import type { AdminNode } from '@gnomevpn/schemas';

import { nodeStatus } from '@/modules/status';

import type { NodeViewInput } from './nodes.types';

import { isoOrNull } from '../shared/listing.helpers';

export const nodeView = ({ node, now }: NodeViewInput): AdminNode => ({
  ...nodeStatus({ node, now }),
  id: node.id,
  country: node.country,
  city: node.city,
  host: node.host,
  port: node.port,
  isAvailable: node.isAvailable,
  isOverloaded: node.isOverloaded,
  displayOrder: node.displayOrder,
  lastHealthyAt: isoOrNull(node.lastHealthyAt),
  createdAt: node.createdAt.toISOString()
});
