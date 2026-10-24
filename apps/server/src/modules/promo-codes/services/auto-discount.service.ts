import { normalisePromoCode } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isNullish } from 'remeda';

import { isUniqueViolation, PrismaService } from '@/core';
import { TrialGrantService } from '@/modules/subscription';

import type { AutoDiscountOffer, AutoDiscountOfferInput, AutomaticCode, EnsureAutoCodeInput } from '../promo-codes.types';

import { AUTO_CODE_SELECT } from '../config';
import { accountRedemptions } from '../lib';
import { PromoDiscountService } from './promo-discount.service';

@Injectable()
export class AutoDiscountService {
  private readonly logger = new Logger(AutoDiscountService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly discounts: PromoDiscountService,
    private readonly grants: TrialGrantService
  ) {}

  async ensure({ code, percent }: EnsureAutoCodeInput): Promise<AutomaticCode | null> {
    const normalised = normalisePromoCode(code);
    const existing = await this.prisma.promoCode.findUnique({ where: { code: normalised }, select: AUTO_CODE_SELECT });

    if (isNullish(existing)) {
      return this.create({ code: normalised, percent });
    }

    if (!existing.isAutomatic || existing.kind !== 'discount') {
      this.logger.error(`promo code ${normalised} already exists and is not an automatic discount, so nothing is granted with it`);

      return null;
    }

    if (existing.percent !== percent) {
      await this.prisma.promoCode.update({ where: { id: existing.id }, data: { percent } });
      this.logger.log(`automatic code ${normalised} now gives ${percent}%`);
    }

    return { id: existing.id, code: normalised, percent, expiresAt: existing.expiresAt };
  }

  async offer({ userId, code, db }: AutoDiscountOfferInput): Promise<AutoDiscountOffer> {
    const held = await this.discounts.pending({ userId, db });

    if (held) {
      return { kind: 'held', percent: held.percent };
    }

    const identities = await this.grants.identitiesOf({ userId, db });
    const used = await db.promoRedemption.count({ where: { promoCode: { isAutomatic: true }, OR: accountRedemptions({ userId, identities }) } });

    if (used > 0) {
      return { kind: 'used' };
    }

    await db.promoRedemption.create({ data: { promoCodeId: code.id, userId, identityHashes: identities } });

    return { kind: 'granted', percent: code.percent };
  }

  private async create({ code, percent }: EnsureAutoCodeInput): Promise<AutomaticCode | null> {
    try {
      const created = await this.prisma.promoCode.create({
        data: { code, kind: 'discount', percent, isAutomatic: true },
        select: AUTO_CODE_SELECT
      });

      this.logger.log(`automatic code ${code} created: ${percent}%`);

      return { id: created.id, code, percent, expiresAt: created.expiresAt };
    } catch (error) {
      if (isUniqueViolation(error)) {
        return this.ensure({ code, percent });
      }

      throw error;
    }
  }
}
