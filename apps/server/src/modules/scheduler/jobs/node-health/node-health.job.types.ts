import type { IdentifiedNode, NodeHealth, XrayClient } from '@/lib/xray';

export type ProbeNodeRow = IdentifiedNode & {
  lastHealthyAt: Date | null;
  createdAt: Date;
};

export type NoteLoadInput = {
  node: IdentifiedNode;
  health: NodeHealth;
};

export type RecordNodeInput = {
  node: IdentifiedNode;
  xray: XrayClient;
};

export type ProbedNode = {
  xray: XrayClient;
  health: NodeHealth;
};
