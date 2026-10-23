import type { PaymentMethod, PaymentMethods } from '@gnomevpn/schemas';
import type { Cache } from 'cache-manager';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { isEmpty } from 'remeda';

import { describeError } from '../../../common/lib';
import { YooKassaClient } from '../../../lib';
import { PAYMENT_METHODS_CACHE } from '../config';
import { offeredMethods } from '../lib';

@Injectable()
export class PaymentMethodsService {
  private readonly logger = new Logger(PaymentMethodsService.name);

  constructor(
    private readonly yookassa: YooKassaClient,
    @Inject(CACHE_MANAGER) private readonly cache: Cache
  ) {}

  async list(): Promise<PaymentMethods> {
    const offered = await this.cache.wrap(
      PAYMENT_METHODS_CACHE.key,
      async () => this.fetch(),
      (methods) => (isEmpty(methods) ? PAYMENT_METHODS_CACHE.fallbackTtlMs : PAYMENT_METHODS_CACHE.ttlMs)
    );

    return { methods: isEmpty(offered) ? [...PAYMENT_METHODS_CACHE.fallback] : offered };
  }

  private async fetch(): Promise<PaymentMethod[]> {
    try {
      const { paymentMethods } = await this.yookassa.shopSettings();

      return offeredMethods(paymentMethods);
    } catch (error) {
      this.logger.warn(`yookassa shop settings unavailable, offering cards only for now: ${describeError(error)}`);

      return [];
    }
  }
}
