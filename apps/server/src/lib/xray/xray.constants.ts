export const PANEL_USERNAME = 'gnomevpn';

export const AUTH_BYTES = 24;

export const XRAY_STATE_RUNNING = 'running';

export const REQUEST_TIMEOUT_MS = 10_000;

export const NO_TRAFFIC = { up: 0, down: 0 } as const;

export const NODE_ACCESS_SELECT = {
  apiUrl: true,
  apiTokenEnvVar: true
} as const;

export const IDENTIFIED_NODE_SELECT = {
  id: true,
  ...NODE_ACCESS_SELECT
} as const;
