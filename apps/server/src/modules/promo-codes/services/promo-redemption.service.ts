import type { PromoRedemption } from '@gnomevpn/schemas';

import { normalisePromoCode, promoCodeOrigin } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isNullish } from 'remeda';

import { AppBadRequestException, AppNotFoundException, AppServiceUnavailableException } from '@/common/exceptions';
import { describeError, hasConfirmedEmail } from '@/common/lib';
import { isUniqueViolation, PrismaService } from '@/core';
import { ReferralService } from '@/modules/referrals';
import { SubscriptionPeriodService, TrialGrantService } from '@/modules/subscription';
import { SubscriptionAccessService } from '@/modules/subscription-link';

import type { Claimed, ClaimInput, RedeemInput } from '../promo-codes.types';

import { FRIEND_REDEMPTION, PROMO_REDEEM, REDEMPTION_REFUSAL } from '../config';
import { accountRedemptions, promoEffect, redemptionRefusal, redemptionResult } from '../lib';

@Injectable()
export class PromoRedemptionService {
  private readonly logger = new Logger(PromoRedemptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly referrals: ReferralService,
    private readonly grants: TrialGrantService,
    private readonly access: SubscriptionAccessService,
    private readonly periods: SubscriptionPeriodService
  ) {}

  async redeem({ userId, code }: RedeemInput): Promise<PromoRedemption> {
    const normalised = normalisePromoCode(code);

    if (promoCodeOrigin(normalised) === 'friend') {
      await this.referrals.attribute({ userId, code: normalised });

      return FRIEND_REDEMPTION;
    }

    await this.requireVerifiedEmail(userId);

    const identities = await this.grants.identitiesOf({ userId });
    const claimed = await this.claimOnce({ userId, code: normalised, identities, now: new Date() });

    if (claimed.effect.kind !== 'discount') {
      await this.access.setEnabledAll({ userId, enabled: true }).catch((error: unknown) => {
        this.logger.error(`access for ${userId} was not re-enabled after a promo code, the sweep will: ${describeError(error)}`);
      });
    }

    return redemptionResult(claimed);
  }

  private async requireVerifiedEmail(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, emailVerified: true } });

    if (isNullish(user) || !hasConfirmedEmail(user)) {
      throw new AppBadRequestException('PROMO_EMAIL_UNVERIFIED', PROMO_REDEEM.unverifiedEmail);
    }
  }

  private async claimOnce(input: Omit<ClaimInput, 'db'>): Promise<Claimed> {
    try {
      return await this.prisma.serializable((tx) => this.claim({ ...input, db: tx }));
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppBadRequestException('PROMO_CODE_ALREADY_USED', REDEMPTION_REFUSAL.PROMO_CODE_ALREADY_USED);
      }

      throw error;
    }
  }

  private async claim({ userId, code, identities, now, db }: ClaimInput): Promise<Claimed> {
    const promo = await db.promoCode.findUnique({
      where: { code },
      select: { id: true, kind: true, percent: true, days: true, maxUses: true, expiresAt: true, isAutomatic: true }
    });

    if (isNullish(promo) || promo.isAutomatic) {
      throw new AppNotFoundException('PROMO_CODE_INVALID', 'No promo code matches');
    }

    const effect = promoEffect(promo);

    if (isNullish(effect)) {
      throw new AppServiceUnavailableException('INTERNAL_ERROR', `promo code ${promo.id} carries no effect`);
    }

    const sameAccount = accountRedemptions({ userId, identities });

    const [uses, usedByAccount] = await Promise.all([
      db.promoRedemption.count({ where: { promoCodeId: promo.id } }),
      db.promoRedemption.count({ where: { promoCodeId: promo.id, OR: sameAccount } })
    ]);

    const refusal = redemptionRefusal({ promo, uses, isUsedByAccount: usedByAccount > 0, now });

    if (refusal) {
      throw new AppBadRequestException(refusal, REDEMPTION_REFUSAL[refusal]);
    }

    if (effect.kind === 'discount') {
      await db.promoRedemption.updateMany({
        where: { userId, consumedAt: null, replacedAt: null, promoCode: { kind: 'discount' } },
        data: { replacedAt: now }
      });
    }

    await db.promoRedemption.create({ data: { promoCodeId: promo.id, userId, identityHashes: identities } });

    if (effect.kind === 'discount') {
      return { effect, currentPeriodEnd: null };
    }

    const currentPeriodEnd = await this.periods.extendAccess({ userId, days: effect.days, now, db });

    return { effect, currentPeriodEnd };
  }
}
