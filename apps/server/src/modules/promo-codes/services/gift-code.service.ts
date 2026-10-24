import type { GiftList } from '@gnomevpn/schemas';

import { GIFT_CODE } from '@gnomevpn/schemas';
import { Injectable } from '@nestjs/common';
import { subMinutes } from 'date-fns';
import { isNonNullish, isNullish } from 'remeda';

import { generateShortCode } from '@/common/lib';
import { AppConfigService } from '@/config';
import { PrismaService } from '@/core';
import { webReferralLink } from '@/modules/referrals';
import { SubscriptionPeriodService } from '@/modules/subscription';

import type { IssueGiftInput, RevokedGift, RevokeGiftInput } from '../promo-codes.types';

import { GIFT } from '../config';
import { giftToIssue, giftView } from '../lib';

@Injectable()
export class GiftCodeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly periods: SubscriptionPeriodService
  ) {}

  async issue({ payment, db }: IssueGiftInput): Promise<string | null> {
    const existing = await db.promoCode.findUnique({ where: { paymentId: payment.id }, select: { code: true } });
    const draft = giftToIssue({ payment, existing });

    if (isNullish(draft)) {
      return existing?.code ?? null;
    }

    const created = await db.promoCode.create({
      data: { ...draft, code: generateShortCode(GIFT_CODE.length) },
      select: { code: true }
    });

    return created.code;
  }

  async revoke({ paymentId, db }: RevokeGiftInput): Promise<RevokedGift | null> {
    const gift = await db.promoCode.findUnique({
      where: { paymentId },
      select: { id: true, days: true, redemptions: { select: { userId: true }, take: 1 } }
    });

    if (isNullish(gift)) {
      return null;
    }

    await db.promoCode.update({ where: { id: gift.id }, data: { expiresAt: new Date() } });

    const redeemerId = gift.redemptions.at(0)?.userId ?? null;

    if (isNullish(redeemerId) || isNullish(gift.days)) {
      return { redeemerId: null, days: 0 };
    }

    const isRewound = await this.periods.rewind({ userId: redeemerId, days: gift.days, db });

    return { redeemerId, days: isRewound ? gift.days : 0 };
  }

  async list(userId: string): Promise<GiftList> {
    const clientUrl = this.config.get('CLIENT_URL');

    const [rows, pendingCount] = await Promise.all([
      this.prisma.promoCode.findMany({
        where: { buyerId: userId, kind: 'gift' },
        orderBy: { createdAt: 'desc' },
        select: {
          code: true,
          plan: true,
          days: true,
          createdAt: true,
          expiresAt: true,
          redemptions: { select: { createdAt: true }, orderBy: { createdAt: 'asc' }, take: 1 }
        }
      }),
      this.prisma.payment.count({
        where: { userId, kind: 'gift', status: 'pending', createdAt: { gt: subMinutes(new Date(), GIFT.pendingMinutes) } }
      })
    ]);

    const gifts = rows.map((row) => giftView({ row, link: webReferralLink({ clientUrl, code: row.code }) })).filter(isNonNullish);

    return { gifts, pendingCount };
  }
}
