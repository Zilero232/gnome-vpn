import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/core';

import type { RecordPendingInput } from './settlement.types';

@Injectable()
export class PendingPaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async record({
    userId,
    paymentId,
    plan,
    amountRub,
    kind,
    isAutoCharge,
    paymentMethodId = null,
    discount = null
  }: RecordPendingInput): Promise<void> {
    await this.prisma.payment.upsert({
      where: { yookassaPaymentId: paymentId },
      update: {},
      create: {
        userId,
        yookassaPaymentId: paymentId,
        amount: amountRub,
        status: 'pending',
        isAutoCharge,
        paymentMethodId,
        kind,
        plan: plan.id,
        promoCodeId: discount?.promoCodeId ?? null,
        discountPercent: discount?.percent ?? null
      }
    });
  }
}
