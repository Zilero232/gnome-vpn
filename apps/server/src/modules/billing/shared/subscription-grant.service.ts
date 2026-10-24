import { findPlan } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isNullish } from 'remeda';
import { match } from 'ts-pattern';

import { AppConfigService } from '@/config';
import { GiftCodeService, PromoDiscountService } from '@/modules/promo-codes';
import { ReferralRewardService } from '@/modules/referrals';
import { SubscriptionPeriodService } from '@/modules/subscription';

import type { RefundOutcome, SettleOutcome } from './payment.types';
import type { ActivateInput, GrantPurchaseInput, RevokePurchaseInput } from './settlement.types';

import { ACTIVATION_SELECT } from './payment.constants';
import { activationData } from './settlement.helpers';

@Injectable()
export class SubscriptionGrantService {
  private readonly logger = new Logger(SubscriptionGrantService.name);

  constructor(
    private readonly config: AppConfigService,
    private readonly periods: SubscriptionPeriodService,
    private readonly gifts: GiftCodeService,
    private readonly discounts: PromoDiscountService,
    private readonly referralReward: ReferralRewardService
  ) {}

  async grant({ row, userId, purchase, method, db }: GrantPurchaseInput): Promise<SettleOutcome> {
    return match(purchase)
      .returnType<Promise<SettleOutcome>>()
      .with({ kind: 'extraDevices' }, async ({ quantity }) => {
        await this.periods.addExtraDevices({ userId, quantity, db });

        return { referral: null, giftCode: null };
      })
      .with({ kind: 'gift' }, async ({ kind, planId }) => {
        const giftCode = await this.gifts.issue({ payment: { id: row.id, kind, plan: planId, userId }, db });

        return { referral: null, giftCode };
      })
      .with({ kind: 'subscription' }, async ({ planId }) => {
        if (row.promoCodeId) {
          await this.discounts.consume({ userId, promoCodeId: row.promoCodeId, paymentId: row.id, db });
        }

        await this.activate({ userId, planId, method, orderedAt: row.createdAt, db });

        const referral = await this.referralReward.reward({ userId, planId, paymentId: row.id, db });

        return { referral, giftCode: null };
      })
      .exhaustive();
  }

  async revoke({ row, purchase, db }: RevokePurchaseInput): Promise<RefundOutcome | null> {
    if (purchase.kind === 'gift') {
      const gift = await this.gifts.revoke({ paymentId: row.id, db });

      this.logger.log(`gift of payment ${row.id} disabled; ${gift?.days ?? 0} days taken back from ${gift?.redeemerId ?? 'nobody'}`);

      return { userId: row.userId, kind: row.kind, referral: null };
    }

    const { userId } = row;

    if (isNullish(userId)) {
      return null;
    }

    return match(purchase)
      .returnType<Promise<RefundOutcome>>()
      .with({ kind: 'extraDevices' }, async ({ quantity }) => {
        await this.periods.removeExtraDevices({ userId, quantity, db });

        return { userId, kind: row.kind, referral: null };
      })
      .with({ kind: 'subscription' }, async ({ planId }) => {
        await this.periods.rewind({ userId, months: findPlan(planId).months, stopsRenewal: true, db });

        const referral = await this.referralReward.revoke({ paymentId: row.id, db });

        return { userId, kind: row.kind, referral };
      })
      .exhaustive();
  }

  private async activate({ userId, planId, method, orderedAt, db }: ActivateInput): Promise<void> {
    const subscription = await db.subscription.findUnique({ where: { userId }, select: ACTIVATION_SELECT });

    const data = activationData({
      subscription,
      plan: findPlan(planId),
      method,
      orderedAt,
      isRecurringEnabled: this.config.get('yookassa').isRecurringEnabled
    });

    await db.subscription.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    });
  }
}
