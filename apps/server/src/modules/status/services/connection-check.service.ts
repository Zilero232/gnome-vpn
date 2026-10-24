import type { ConnectionCheckInput, ConnectionResult } from '@gnomevpn/schemas';
import type { Cache } from 'cache-manager';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Resolver } from 'node:dns/promises';
import { isEmpty, isNullish } from 'remeda';

import { isIpAddress } from '@/common/lib';
import { PrismaService } from '@/core';

import type { NodeAddress } from '../lib';
import type { AddressNodeRow, NodeLookup } from '../status.types';

import { ADDRESS_NODE_SELECT, CONNECTION_CHECK } from '../config';
import { countryForIp } from '../lib';

@Injectable()
export class ConnectionCheckService {
  private readonly logger = new Logger(ConnectionCheckService.name);
  private readonly resolver = new Resolver(CONNECTION_CHECK.resolver);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache
  ) {}

  async check({ ip }: ConnectionCheckInput): Promise<ConnectionResult> {
    const addresses = await this.addresses();
    const countryCode = countryForIp({ addresses, ip });

    return isNullish(countryCode) ? { viaGnome: false } : { viaGnome: true, countryCode };
  }

  private async addresses(): Promise<NodeAddress[]> {
    const lookups = await this.cache.wrap(
      CONNECTION_CHECK.addressCacheKey,
      async () => this.lookup(),
      (nodes) => (nodes.every(({ addresses }) => !isEmpty(addresses)) ? CONNECTION_CHECK.addressCacheTtlMs : CONNECTION_CHECK.failedLookupTtlMs)
    );

    return lookups.flatMap(({ countryCode, addresses }) => addresses.map((address) => ({ address, countryCode })));
  }

  private async lookup(): Promise<NodeLookup[]> {
    const nodes = await this.prisma.node.findMany({ where: { isAvailable: true }, select: ADDRESS_NODE_SELECT });

    return Promise.all(nodes.map(async (node) => ({ countryCode: node.countryCode, addresses: await this.resolve(node) })));
  }

  private async resolve({ id, host }: AddressNodeRow): Promise<string[]> {
    if (isIpAddress(host)) {
      return [host];
    }

    const lookups = await Promise.allSettled([this.resolver.resolve4(host), this.resolver.resolve6(host)]);
    const addresses = lookups.flatMap((lookup) => (lookup.status === 'fulfilled' ? lookup.value : []));

    if (isEmpty(addresses)) {
      this.logger.warn(`node ${id} did not resolve, so the connection check cannot recognise it`);
    }

    return addresses;
  }
}
