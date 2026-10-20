import type { IdentifiedNode } from '../../../../common/lib';
import type { NodeHealth, XrayClient } from '../../../../lib';

export type { IdentifiedNode as ProbeNodeRow } from '../../../../common/lib';

export type NoteLoadInput = {
  node: IdentifiedNode;
  health: NodeHealth;
};

export type RecordNodeInput = {
  node: IdentifiedNode;
  xray: XrayClient;
};
