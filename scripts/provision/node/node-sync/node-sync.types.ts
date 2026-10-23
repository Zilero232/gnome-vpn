export type SyncableNode = {
  country: string;
  countryCode: string;
  city: string | null;
  host: string;
  port: number;
  serverName: string;
  certFingerprint: string | null;
  realityPublicKey: string | null;
  realityShortId: string | null;
  wgPublicKey: string | null;
  apiUrl: string;
  apiTokenEnvVar: string;
  displayOrder: number;
};

export type SyncToProductionInput = {
  nodes: SyncableNode[];
  envNodes: string;
  pruneMissing: boolean;
};

export type SyncStatus = 'failed' | 'skipped' | 'synced';

export type SyncResult = {
  status: SyncStatus;
  message: string;
};

export type BuildNodeSyncInput = {
  nodes: SyncableNode[];
  pruneMissing: boolean;
};

export type InstallEnvFileCommandInput = {
  uploadPath: string;
  targetPath: string;
};

export type IsSameEnvFileInput = {
  previous: string | null;
  next: string;
};

export type ApplySqlCommandInput = {
  deployPath: string;
  sql: string;
  delimiter: string;
};
