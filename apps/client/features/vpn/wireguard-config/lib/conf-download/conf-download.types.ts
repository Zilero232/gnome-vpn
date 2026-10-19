import type { WireguardConfigFile } from '@gnomevpn/schemas';

export type DownloadConfInput = Pick<WireguardConfigFile, 'conf' | 'filename'>;
