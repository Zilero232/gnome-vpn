import type { IdentifiedNode, NodeHealth, XrayClient } from '@/lib/xray';
import type { LoadResource } from '@/modules/telegram/notify';

export type ProbeNodeRow = IdentifiedNode & {
  host: string;
  port: number;
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

export type LoadReading = {
  resource: LoadResource;
  percent: number | null;
  threshold: number;
};

export type NoteReadingInput = {
  node: IdentifiedNode;
  reading: LoadReading;
};

export type RecordNodeInput = {
  node: IdentifiedNode;
  xray: XrayClient;
};

export type ProbedNode = {
  xray: XrayClient;
  health: NodeHealth;
};

export type RecordActivityInput = RecordNodeInput & {
  health: NodeHealth;
};
