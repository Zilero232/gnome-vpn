import { milliseconds } from 'date-fns';

export const GEO_FILES = {
  route: 'routing/geo',
  names: { geosite: 'geosite.dat', geoip: 'geoip.dat' },
  sidecarSuffix: '.sha256',
  upstream: {
    geosite: 'https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat',
    geoip: 'https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geoip.dat'
  },
  fetchTimeoutMs: milliseconds({ minutes: 3 }),
  retryCooldownMs: milliseconds({ minutes: 10 }),
  contentType: { data: 'application/octet-stream', sidecar: 'text/plain; charset=utf-8' },
  cacheControl: 'no-cache'
} as const;
