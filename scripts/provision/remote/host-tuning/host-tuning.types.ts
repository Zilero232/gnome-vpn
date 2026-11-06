import type { SshClient } from '@gnomevpn/scripts/ssh';

import type { APT_JOBS } from './host-tuning.constants';

export type AptJobUnit = (typeof APT_JOBS.units)[number];

export type ReadRemoteFileInput = {
  ssh: SshClient;
  path: string;
};

export type PutConfInput = ReadRemoteFileInput & {
  content: string;
};
