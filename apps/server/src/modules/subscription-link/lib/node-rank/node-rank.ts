import { partition } from 'remeda';

import { isLossy } from '@/modules/status';

import type { RankedNode } from './node-rank.types';

export const healthyFirst = <TNode extends RankedNode>(nodes: TNode[]): TNode[] => {
  const [lossy, healthy] = partition(nodes, (node) => isLossy(node.packetLoss));

  return [...healthy, ...lossy];
};
