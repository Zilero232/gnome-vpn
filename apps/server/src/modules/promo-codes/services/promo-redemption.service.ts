import type { PromoRedemption } from '@gnomevpn/schemas';

import { DEFAULT_PLAN_ID, isPlaceholderEmail, normalisePromoCode, promoCodeOrigin } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isEmpty, isNullish } from 'remeda';

import type { Claimed, ClaimInput, ExtendAccessInput, RedeemInput } from '../promo-codes.types';

import { AppBadRequestException, AppNotFoundException, AppServiceUnavailableException } from '../../../common/exceptions';
import { describeError } from '../../../common/lib';
import { isPrismaRequestError, PrismaService, UNIQUE_VIOLATION, withSerializableRetry } from '../../../core';
import { ReferralService } from '../../referrals';
import { TrialGrantService } from '../../subscription';
import { SubscriptionAccessService } from '../../subscription-link';
import { FRIEND_REDEMPTION, PROMO_REDEEM, REDEMPTION_REFUSAL } from '../config';
import { accessExtension, promoEffect, redemptionRefusal, redemptionResult } from '../lib';

@Injectable()
export class PromoRedemptionService {
  private readonly logger = new Logger(PromoRedemptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly referrals: ReferralService,
    private readonly grants: TrialGrantService,
    private readonly access: SubscriptionAccessService
  ) {}

  async redeem({ userId, code, source = 'web' }: RedeemInput): Promise<PromoRedemption> {
    const normalised = normalisePromoCode(code);

    if (promoCodeOrigin(normalised) === 'friend') {
      await this.referrals.attribute({ userId, code: normalised, source });

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

    if (isNullish(user) || (!user.emailVerified && !isPlaceholderEmail(user.email))) {
      throw new AppBadRequestException('PROMO_EMAIL_UNVERIFIED', PROMO_REDEEM.unverifiedEmail);
    }
  }

  private async claimOnce(input: Omit<ClaimInput, 'db'>): Promise<Claimed> {
    try {
      return await withSerializableRetry(() =>
        this.prisma.$transaction((tx) => this.claim({ ...input, db: tx }), { isolationLevel: 'Serializable' })
      );
    } catch (error) {
      if (isPrismaRequestError(error) && error.code === UNIQUE_VIOLATION) {
        throw new AppBadRequestException('PROMO_CODE_ALREADY_USED', REDEMPTION_REFUSAL.PROMO_CODE_ALREADY_USED);
      }

      throw error;
    }
  }

  private async claim({ userId, code, identities, now, db }: ClaimInput): Promise<Claimed> {
    const promo = await db.promoCode.findUnique({
      where: { code },
      select: { id: true, kind: true, percent: true, days: true, maxUses: true, expiresAt: true }
    });

    if (isNullish(promo)) {
      throw new AppNotFoundException('PROMO_CODE_INVALID', 'No promo code matches');
    }

    const effect = promoEffect(promo);

    if (isNullish(effect)) {
      throw new AppServiceUnavailableException('INTERNAL_ERROR', `promo code ${promo.id} carries no effect`);
    }

    const sameAccount = isEmpty(identities) ? [{ userId }] : [{ userId }, { identityHashes: { hasSome: identities } }];

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

    const currentPeriodEnd = await this.extendAccess({ userId, days: effect.days, now, db });

    return { effect, currentPeriodEnd };
  }

  private async extendAccess({ userId, days, now, db }: ExtendAccessInput): Promise<Date> {
    const subscription = await db.subscription.findUnique({ where: { userId }, select: { currentPeriodEnd: true } });
    const extension = accessExtension({ currentPeriodEnd: subscription?.currentPeriodEnd, days, now });
    const data = { currentPeriodEnd: extension.currentPeriodEnd, ...(extension.resetsExtras && { extraDevices: 0 }) };

    await db.subscription.upsert({
      where: { userId },
      create: { userId, plan: DEFAULT_PLAN_ID, ...data },
      update: data
    });

    return extension.currentPeriodEnd;
  }
}
