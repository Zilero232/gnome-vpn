import type { GeoKind } from '../geo-files';

export type StoredRouting = {
  ruDirect: boolean;
  blockAds: boolean;
  routingUpdatedAt: Date | null;
};

export type RoutingProfileInput = {
  stored: StoredRouting;
  apiUrl: string;
};

export type IncyRoutingInput = RoutingProfileInput & {
  app: string | null;
};

export type IncyRouting = {
  line: string;
  headers: Record<string, string>;
};

export type RoutingGeoTags = Record<GeoKind, string[]>;

export type RoutingProfile = {
  Name: string;
  GlobalProxy: string;
  LastUpdated: string;
  RemoteDNSType: string;
  RemoteDNSDomain: string;
  RemoteDNSIP: string;
  DomesticDNSType: string;
  DomesticDNSDomain: string;
  DomesticDNSIP: string;
  DnsHosts: Record<string, string>;
  FakeDNS: string;
  Geoipurl: string;
  Geositeurl: string;
  DirectSites: string[];
  DirectIp: string[];
  ProxySites: string[];
  ProxyIp: string[];
  BlockSites: string[];
  BlockIp: string[];
  DomainStrategy: string;
  useChunkFiles: boolean;
};

export type NextRoutingStampInput = {
  previous: Date | null;
  now: Date;
};
