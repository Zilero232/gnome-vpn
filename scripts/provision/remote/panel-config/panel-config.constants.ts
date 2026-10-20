export const PANEL_BOOT = {
  timeoutMs: 90_000,
  intervalMs: 3_000,
  probeTimeoutSeconds: 5,
  readyStatus: '200'
} as const;

export const CORE_SETTING = {
  restartOnClientDisable: 'restartXrayOnClientDisable'
} as const;

export const TOKEN_PROBE = {
  acceptedStatus: '200',
  rejectedStatus: '401',
  timeoutSeconds: 15
} as const;

export const PANEL_CLI = {
  binary: '/app/x-ui',
  token: /apiToken:\s*(\S+)/,
  failure: /^Failed.*$/m
} as const;

export const SETTINGS_UPLOAD = {
  fileName: 'settings.json'
} as const;
