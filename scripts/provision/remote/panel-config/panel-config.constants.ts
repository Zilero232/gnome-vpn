export const PANEL_BOOT = {
  timeoutMs: 90_000,
  intervalMs: 3_000
} as const;

export const CORE_SETTING = {
  restartOnClientDisable: 'restartXrayOnClientDisable'
} as const;

export const PANEL_TOKEN = {
  accepted: /"success"\s*:\s*true/u
} as const;
