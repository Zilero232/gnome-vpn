import { formatGiftCode, giftDays } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isNullish } from 'remeda';
import { match } from 'ts-pattern';

import { describeError } from '@/common/lib';
import { SubscriptionPeriodService } from '@/modules/subscription';
import { TelegramAlertService } from '@/modules/telegram/services/telegram-alert.service';
import { TelegramNotifyService } from '@/modules/telegram/services/telegram-notify.service';

import type { AnnounceInput, AnnounceReferralInput, ChargeFailedInput, SettledNoticeInput } from './notice.types';

@Injectable()
export class PaymentNoticeService {
  private readonly logger = new Logger(PaymentNoticeService.name);

  constructor(
    private readonly notify: TelegramNotifyService,
    private readonly alerts: TelegramAlertService,
    private readonly periods: SubscriptionPeriodService
  ) {}

  async settled({ row, userId, purchase, outcome }: SettledNoticeInput): Promise<void> {
    this.alerts.paymentSettled({ userId, purchase: row, amount: row.amount.toNumber(), isAutoCharge: row.isAutoCharge });

    await this.announce({ row, userId, purchase, giftCode: outcome.giftCode });

    if (outcome.referral) {
      await this.announceReferral({ friendId: userId, outcome: outcome.referral });
    }
  }

  async chargeFailed({ userId, reason, isCardDropped }: ChargeFailedInput): Promise<void> {
    this.alerts.chargeFailed({ userId, reason, isCardDropped });

    await this.notify.tell({ userId, notice: 'chargeFailed', date: await this.periods.periodEnd(userId) });
  }

  private async announce({ row, userId, purchase, giftCode }: AnnounceInput): Promise<void> {
    await match(purchase)
      .with({ kind: 'extraDevices' }, () => this.notify.tell({ userId, notice: 'devicesAdded' }))
      .with({ kind: 'gift' }, async ({ planId }) => {
        if (giftCode) {
          await this.notify.tell({ userId, notice: 'giftPurchased', days: giftDays(planId), fill: { code: formatGiftCode(giftCode) } });
        }
      })
      .with({ kind: 'subscription' }, async ({ planId }) => {
        const date = await this.periods.periodEnd(userId);

        if (row.isAutoCharge) {
          await this.notify.tell({ userId, notice: 'renewed', date, fill: { amount: String(row.amount) } });

          return;
        }

        await this.notify.tell({ userId, notice: 'paid', date, invite: planId });
      })
      .exhaustive();
  }

  private async announceReferral({ friendId, outcome }: AnnounceReferralInput): Promise<void> {
    try {
      await this.notify.tell({ userId: friendId, notice: 'referralBonus', days: outcome.friendDays });

      const { referrerId } = outcome;

      if (isNullish(referrerId)) {
        return;
      }

      if (outcome.referrerDays === 0) {
        this.logger.log(`referral reward for ${referrerId} skipped: the cap is reached`);

        return;
      }

      if (outcome.isBanked) {
        await this.notify.tell({ userId: referrerId, notice: 'referralBanked', days: outcome.referrerDays });

        return;
      }

      await this.notify.tell({
        userId: referrerId,
        notice: 'referralRewarded',
        days: outcome.referrerDays,
        date: await this.periods.periodEnd(referrerId)
      });
    } catch (error) {
      this.logger.error(`the referral reward for the payment of ${friendId} was not announced: ${describeError(error)}`);
    }
  }
}
