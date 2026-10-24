import { fromUnixTime, getUnixTime } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';

import { deviceIdentity } from '@/modules/devices';
import { geoFileUrl } from '@/modules/subscription-link/lib/geo-files';

import type { RoutingProfile, StoredRouting } from '../incy-routing.types';

import { incyRouting, routingGeoTags, routingProfile } from '../incy-routing';
import { GEO_TAG_PREFIX, ROUTING_DNS, ROUTING_GEO, ROUTING_LINK, ROUTING_PROFILE, ROUTING_RULES } from '../incy-routing.constants';
import { nextRoutingStamp } from '../incy-routing.helpers';

const INCY = deviceIdentity({ 'user-agent': 'INCY/2.5.1/ios CFNetwork/3826.500.131 Darwin/24.5.0' }).app;
const API_URL = 'https://api.example.com';

const stored = (overrides: Partial<StoredRouting> = {}): StoredRouting => ({
  ruDirect: true,
  blockAds: false,
  routingUpdatedAt: null,
  ...overrides
});

const profileOf = (overrides: Partial<StoredRouting> = {}): RoutingProfile | null => routingProfile({ stored: stored(overrides), apiUrl: API_URL });

const COMBINATIONS = [{}, { blockAds: true }, { ruDirect: false, blockAds: true }];

const decoded = (line: string): unknown => JSON.parse(Buffer.from(line.slice(ROUTING_LINK.onadd.length), 'base64').toString('utf8'));

describe('incyRouting', () => {
  it('speaks only to INCY, whose routing line other apps would read as a broken server', () => {
    for (const userAgent of ['Hiddify/2.5.7', 'v2rayNG/1.10.0', 'Happ/3.1.0', 'curl/8.4.0']) {
      expect(incyRouting({ app: deviceIdentity({ 'user-agent': userAgent }).app, stored: stored(), apiUrl: API_URL })).toBeNull();
    }

    expect(incyRouting({ app: null, stored: stored(), apiUrl: API_URL })).toBeNull();
    expect(incyRouting({ app: INCY, stored: stored(), apiUrl: API_URL })).not.toBeNull();
  });

  it('turns routing off when both switches are off, without a geo schedule', () => {
    expect(incyRouting({ app: INCY, stored: stored({ ruDirect: false }), apiUrl: API_URL })).toEqual({ line: ROUTING_LINK.off, headers: {} });
  });

  it('carries the profile as standard base64 that decodes back to exactly what was built', () => {
    const line = incyRouting({ app: INCY, stored: stored({ blockAds: true }), apiUrl: API_URL })?.line ?? '';

    expect(line.startsWith(ROUTING_LINK.onadd)).toBe(true);
    expect(line.slice(ROUTING_LINK.onadd.length)).toMatch(/^[\d+/A-Za-z]+={0,2}$/u);
    expect(decoded(line)).toEqual(profileOf({ blockAds: true }));
  });

  it('asks INCY to refresh the geo files on the schedule only alongside a profile', () => {
    const routing = incyRouting({ app: INCY, stored: stored(), apiUrl: API_URL });

    expect(routing?.headers[ROUTING_GEO.updateHeader]).toBe(String(ROUTING_GEO.updateIntervalHours));
  });
});

describe('routingProfile', () => {
  it('sends nothing to build when both switches are off', () => {
    expect(profileOf({ ruDirect: false, blockAds: false })).toBeNull();
  });

  it('sends Russian sites and addresses direct, and blocks nothing, by default', () => {
    const profile = profileOf();

    expect(profile?.DirectSites).toEqual([...ROUTING_RULES.local.sites, ...ROUTING_RULES.ruDirect.sites]);
    expect(profile?.DirectIp).toEqual([...ROUTING_RULES.local.ips, ...ROUTING_RULES.ruDirect.ips]);
    expect(profile?.BlockSites).toEqual([]);
  });

  it('keeps only the local network direct when only ad blocking is on, so a router or a printer never goes through the tunnel', () => {
    const profile = profileOf({ ruDirect: false, blockAds: true });

    expect(profile?.DirectSites).toEqual(ROUTING_RULES.local.sites);
    expect(profile?.DirectIp).toEqual(ROUTING_RULES.local.ips);
    expect(profile?.BlockSites).toEqual(ROUTING_RULES.blockAds.sites);
  });

  it('combines both lists when both switches are on', () => {
    const profile = profileOf({ blockAds: true });

    expect(profile?.DirectSites).toEqual([...ROUTING_RULES.local.sites, ...ROUTING_RULES.ruDirect.sites]);
    expect(profile?.BlockSites).toEqual(ROUTING_RULES.blockAds.sites);
  });

  it('keeps one name for every combination, so INCY updates the profile instead of adding another', () => {
    expect(new Set(COMBINATIONS.map((overrides) => profileOf(overrides)?.Name))).toEqual(new Set([ROUTING_PROFILE.name]));
  });

  it('never matches a bare domain, which Xray reads as a substring', () => {
    const domains = ROUTING_RULES.ruDirect.sites.filter((site) => !site.startsWith(GEO_TAG_PREFIX.geosite));

    expect(domains.every((site) => site.startsWith('domain:'))).toBe(true);
  });

  it('downloads the geo files from our own API', () => {
    const profile = profileOf();

    expect(profile?.Geositeurl).toBe(geoFileUrl({ apiUrl: API_URL, kind: 'geosite' }));
    expect(profile?.Geoipurl).toBe(geoFileUrl({ apiUrl: API_URL, kind: 'geoip' }));
  });

  it('resolves through the ad-blocking resolver only while ad blocking is on, pinned so it needs no lookup', () => {
    const plain = profileOf();
    const blocking = profileOf({ blockAds: true });

    expect(plain?.RemoteDNSDomain).toBe(ROUTING_DNS.remote.plain.domain);
    expect(plain?.DnsHosts).toEqual({ [ROUTING_DNS.remote.plain.host]: plain?.RemoteDNSIP });
    expect(blocking?.RemoteDNSDomain).toBe(ROUTING_DNS.remote.adBlocking.domain);
    expect(blocking?.DnsHosts).toEqual({ [ROUTING_DNS.remote.adBlocking.host]: blocking?.RemoteDNSIP });
  });

  it('keeps Russian names on the domestic resolver whatever the switches say', () => {
    const domestic = COMBINATIONS.map((overrides) => profileOf(overrides)?.DomesticDNSIP);

    expect(new Set(domestic)).toEqual(new Set([ROUTING_DNS.domestic.ip]));
  });
});

describe('routingGeoTags', () => {
  it('holds every geo tag any profile names, so the trimmed files never lack one', () => {
    const tags = routingGeoTags();

    for (const overrides of COMBINATIONS) {
      const profile = profileOf(overrides);
      const rules = [...(profile?.DirectSites ?? []), ...(profile?.DirectIp ?? []), ...(profile?.BlockSites ?? [])];

      for (const rule of rules.filter((entry) => entry.startsWith(GEO_TAG_PREFIX.geosite))) {
        expect(tags.geosite).toContain(rule.slice(GEO_TAG_PREFIX.geosite.length));
      }

      for (const rule of rules.filter((entry) => entry.startsWith(GEO_TAG_PREFIX.geoip))) {
        expect(tags.geoip).toContain(rule.slice(GEO_TAG_PREFIX.geoip.length));
      }
    }
  });

  it('holds nothing but tags, since a domain rule needs no geo file', () => {
    const tags = routingGeoTags();

    expect([...tags.geosite, ...tags.geoip].some((tag) => tag.includes(':'))).toBe(false);
  });
});

describe('LastUpdated', () => {
  const revision = fromUnixTime(ROUTING_PROFILE.revision);

  it('is the rules revision while the user has never touched the switches', () => {
    expect(profileOf()?.LastUpdated).toBe(String(ROUTING_PROFILE.revision));
  });

  it('moves past the rules revision with any choice, even one made before the rules last changed', () => {
    const older = new Date(revision.getTime() - 60_000);

    expect(Number(profileOf({ routingUpdatedAt: older })?.LastUpdated)).toBeGreaterThan(ROUTING_PROFILE.revision);
  });

  it('adds the seconds since the epoch of the choice, in whole seconds', () => {
    const toggled = new Date(revision.getTime() + 90_500);

    expect(profileOf({ routingUpdatedAt: toggled })?.LastUpdated).toBe(
      String(ROUTING_PROFILE.revision + getUnixTime(toggled) - ROUTING_PROFILE.epoch)
    );
  });

  it('keeps the revision and the epoch inside the 32-bit range INCY may parse into', () => {
    const decade = 10 * 365 * 86_400;

    expect(ROUTING_PROFILE.epoch).toBeLessThanOrEqual(ROUTING_PROFILE.revision);
    expect(ROUTING_PROFILE.revision + decade).toBeLessThan(2 ** 31);
  });

  it('grows with every later change, which is all INCY accepts as an update', () => {
    const first = new Date(revision.getTime() + 60_000);
    const second = new Date(first.getTime() + 60_000);

    const before = Number(profileOf({ routingUpdatedAt: first })?.LastUpdated);
    const after = Number(profileOf({ blockAds: true, routingUpdatedAt: second })?.LastUpdated);

    expect(after).toBeGreaterThan(before);
  });

  it('does not move with the clock, since every bump makes INCY fetch the profile and its files again', () => {
    const choice = { routingUpdatedAt: new Date(revision.getTime() + 60_000) };

    vi.useFakeTimers();
    vi.setSystemTime(revision);

    const early = profileOf(choice)?.LastUpdated;

    vi.setSystemTime(new Date(revision.getTime() + 86_400_000));

    const late = profileOf(choice)?.LastUpdated;

    vi.useRealTimers();

    expect(late).toBe(early);
  });
});

describe('nextRoutingStamp', () => {
  const now = new Date('2026-10-24T12:00:00.000Z');

  it('is now for a first choice or one long after the last', () => {
    expect(nextRoutingStamp({ previous: null, now })).toEqual(now);
    expect(nextRoutingStamp({ previous: new Date(now.getTime() - 60_000), now })).toEqual(now);
  });

  it('moves at least a whole second past the last choice, so two toggles in one second still change LastUpdated', () => {
    const previous = new Date(now.getTime() - 200);
    const next = nextRoutingStamp({ previous, now });

    expect(getUnixTime(next)).toBeGreaterThan(getUnixTime(previous));
  });
});
