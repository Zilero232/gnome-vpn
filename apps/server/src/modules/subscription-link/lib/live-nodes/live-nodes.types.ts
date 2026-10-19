import type { AnnouncementNode } from '../announcement';

export type LiveNodesInput<TNode extends AnnouncementNode> = {
  nodes: TNode[];
  now: Date;
};
