import type { IdentifiedNode, NodeHealth, XrayClient } from '@/lib/xray';

export type ProbeNodeRow = IdentifiedNode & {
  lastHealthyAt: Date | null;
  bootedAt: Date | null;
  coreStartedAt: Date | null;
  createdAt: Date;
};

export type NoteRestartInput = {
  node: ProbeNodeRow;
  health: NodeHealth;
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
