import type { GeoKind } from '../geo-files';

export const ROUTING_PROFILE = {
  name: 'GnomeVPN',
  revision: 1_792_737_600,
  epoch: 1_792_706_400,
  stampStepMs: 1000,
  globalProxy: true,
  domainStrategy: 'IPIfNonMatch',
  useChunkFiles: false
} as const;

export const ROUTING_LINK = {
  onadd: 'incy://routing/onadd/',
  off: 'incy://routing/off'
} as const;

export const ROUTING_GEO = {
  updateHeader: 'routing-geo-update-interval',
  updateIntervalHours: 24
} as const;

export const ROUTING_DNS = {
  remote: {
    plain: { type: 'DoH', host: 'cloudflare-dns.com', domain: 'https://cloudflare-dns.com/dns-query', ip: '1.1.1.1' },
    adBlocking: { type: 'DoH', host: 'dns.adguard-dns.com', domain: 'https://dns.adguard-dns.com/dns-query', ip: '94.140.14.14' }
  },
  domestic: { type: 'DoU', domain: '', ip: '77.88.8.8' },
  fakeDns: false
} as const;

export const ROUTING_RULES = {
  local: {
    sites: ['geosite:private'],
    ips: ['geoip:private']
  },
  ruDirect: {
    sites: ['domain:ru', 'domain:su', 'domain:xn--p1ai', 'geosite:category-ru', 'geosite:category-gov-ru'],
    ips: ['geoip:ru']
  },
  blockAds: {
    sites: ['geosite:category-ads']
  }
} as const;

export const GEO_TAG_PREFIX = {
  geosite: 'geosite:',
  geoip: 'geoip:'
} as const satisfies Record<GeoKind, string>;
