import type { SshClient } from '@gnomevpn/scripts/ssh';

export type KeyFileSeed = {
  path: string;
  value: string;
};

export type SeedKeyFilesScriptInput = {
  dir: string;
  seed: KeyFileSeed[];
};

export type EnsureKeyFilesInput = {
  ssh: SshClient;
  label: string;
  seed: KeyFileSeed[];
};

export type EnsuredKeyFiles = {
  values: string[];
  wasGenerated: boolean;
};

export type EnsuredRealityKeys = {
  privateKey: string;
  publicKey: string;
  shortId: string;
  wasGenerated: boolean;
};

export type EnsuredWireguardKeys = {
  privateKey: string;
  publicKey: string;
  wasGenerated: boolean;
};
