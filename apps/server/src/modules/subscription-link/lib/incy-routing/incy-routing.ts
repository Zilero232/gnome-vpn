import { isNullish, mapValues } from 'remeda';

import type { IncyRouting, IncyRoutingInput, RoutingGeoTags, RoutingProfile, RoutingProfileInput } from './incy-routing.types';

import { DEVICE_KEY } from '../../../devices';
import { geoFileUrl } from '../geo-files';
import { GEO_TAG_PREFIX, ROUTING_DNS, ROUTING_GEO, ROUTING_LINK, ROUTING_PROFILE, ROUTING_RULES } from './incy-routing.constants';
import { encodedProfile, lastUpdated } from './incy-routing.helpers';

export const routingProfile = ({ stored, apiUrl }: RoutingProfileInput): RoutingProfile | null => {
  const { ruDirect, blockAds, routingUpdatedAt } = stored;

  if (!ruDirect && !blockAds) {
    return null;
  }

  const remote = blockAds ? ROUTING_DNS.remote.adBlocking : ROUTING_DNS.remote.plain;

  return {
    Name: ROUTING_PROFILE.name,
    GlobalProxy: String(ROUTING_PROFILE.globalProxy),
    LastUpdated: String(lastUpdated(routingUpdatedAt)),
    RemoteDNSType: remote.type,
    RemoteDNSDomain: remote.domain,
    RemoteDNSIP: remote.ip,
    DomesticDNSType: ROUTING_DNS.domestic.type,
    DomesticDNSDomain: ROUTING_DNS.domestic.domain,
    DomesticDNSIP: ROUTING_DNS.domestic.ip,
    DnsHosts: { [remote.host]: remote.ip },
    FakeDNS: String(ROUTING_DNS.fakeDns),
    Geoipurl: geoFileUrl({ apiUrl, kind: 'geoip' }),
    Geositeurl: geoFileUrl({ apiUrl, kind: 'geosite' }),
    DirectSites: [...ROUTING_RULES.local.sites, ...(ruDirect ? ROUTING_RULES.ruDirect.sites : [])],
    DirectIp: [...ROUTING_RULES.local.ips, ...(ruDirect ? ROUTING_RULES.ruDirect.ips : [])],
    ProxySites: [],
    ProxyIp: [],
    BlockSites: blockAds ? [...ROUTING_RULES.blockAds.sites] : [],
    BlockIp: [],
    DomainStrategy: ROUTING_PROFILE.domainStrategy,
    useChunkFiles: ROUTING_PROFILE.useChunkFiles
  };
};

export const routingGeoTags = (): RoutingGeoTags => {
  const rules: string[] = [
    ...ROUTING_RULES.local.sites,
    ...ROUTING_RULES.local.ips,
    ...ROUTING_RULES.ruDirect.sites,
    ...ROUTING_RULES.ruDirect.ips,
    ...ROUTING_RULES.blockAds.sites
  ];

  return mapValues(GEO_TAG_PREFIX, (prefix) => rules.filter((rule) => rule.startsWith(prefix)).map((rule) => rule.slice(prefix.length)));
};

export const incyRouting = ({ app, stored, apiUrl }: IncyRoutingInput): IncyRouting | null => {
  if (app !== DEVICE_KEY.incyApp) {
    return null;
  }

  const profile = routingProfile({ stored, apiUrl });

  if (isNullish(profile)) {
    return { line: ROUTING_LINK.off, headers: {} };
  }

  return {
    line: `${ROUTING_LINK.onadd}${encodedProfile(profile)}`,
    headers: { [ROUTING_GEO.updateHeader]: String(ROUTING_GEO.updateIntervalHours) }
  };
};
