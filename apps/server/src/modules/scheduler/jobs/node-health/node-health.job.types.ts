import type { IdentifiedNode } from '../../../../common/lib';
import type { NodeHealth, XrayClient } from '../../../../lib';

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
