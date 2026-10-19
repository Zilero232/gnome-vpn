import { isEmpty } from 'remeda';

import type { AnnouncementNode } from '../announcement';
import type { LiveNodesInput } from './live-nodes.types';

import { isStale } from '../announcement';

export const liveNodes = <TNode extends AnnouncementNode>({ nodes, now }: LiveNodesInput<TNode>): TNode[] => {
  const live = nodes.filter((node) => !isStale({ node, now }));

  return isEmpty(live) ? nodes : live;
};
