import type { ConnectionCheckInput, ConnectionResult } from '@gnomevpn/schemas';
import type { Cache } from 'cache-manager';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Resolver } from 'node:dns/promises';
import { isEmpty, isNonNullish, isNullish } from 'remeda';

import type { NodeAddress } from '../lib';
import type { AddressNodeRow } from '../status.types';

import { PrismaService } from '../../../core';
import { ADDRESS_NODE_SELECT, CONNECTION_CHECK } from '../config';
import { countryForIp, isIpAddress } from '../lib';

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
    const cached = await this.cache.get<NodeAddress[]>(CONNECTION_CHECK.addressCacheKey);

    if (isNonNullish(cached)) {
      return cached;
    }

    const nodes = await this.prisma.node.findMany({ where: { isAvailable: true }, select: ADDRESS_NODE_SELECT });
    const resolved = await Promise.all(nodes.map(async (node) => ({ node, addresses: await this.resolve(node) })));
    const isComplete = resolved.every(({ addresses }) => !isEmpty(addresses));
    const addresses = resolved.flatMap(({ node, addresses: own }) => own.map((address) => ({ address, countryCode: node.countryCode })));

    await this.cache.set(
      CONNECTION_CHECK.addressCacheKey,
      addresses,
      isComplete ? CONNECTION_CHECK.addressCacheTtlMs : CONNECTION_CHECK.failedLookupTtlMs
    );

    return addresses;
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
