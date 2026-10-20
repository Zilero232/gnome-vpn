import type { SshClient } from '@gnomevpn/scripts/ssh';
import type { z } from 'zod';

export type ConfigurePanelInput = {
  ssh: SshClient;
  password: string;
  panelPath: string;
  knownToken: string | null;
};

export type IssueTokenInput = {
  ssh: SshClient;
  panelPath: string;
  knownToken: string | null;
};

export type ProbeTokenInput = {
  ssh: SshClient;
  panelPath: string;
  token: string;
};

export type TokenVerdict = 'accepted' | 'rejected';

export type WaitForPanelListeningInput = {
  ssh: SshClient;
  panelPath: string;
  timeoutMs: number;
};

export type RunPanelCliInput = {
  ssh: SshClient;
  args: string[];
};

export type PanelApiUrlInput = {
  panelPath: string;
  route: string;
};

export type KeepCoreRunningInput = {
  ssh: SshClient;
  panelPath: string;
  token: string;
};

export type ParsePanelReplyInput<Schema extends z.ZodType> = {
  raw: string;
  schema: Schema;
  action: string;
};
