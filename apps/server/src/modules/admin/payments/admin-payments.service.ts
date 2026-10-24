import type { AdminCsvFile, AdminPayment, AdminPaymentPage } from '@gnomevpn/schemas';

import { ADMIN_EXPORT, adminCsvFileSchema, adminPaymentPageSchema, adminPaymentSchema } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';

import { AppBadRequestException } from '@/common/exceptions';
import { describeError } from '@/common/lib';
import { PrismaService } from '@/core';
import { YooKassaClient } from '@/lib/yookassa';

import type { PaymentFilter, PaymentQuery, RefundActionInput } from './payments.types';

import { AdminAuditService } from '../shared/admin-audit.service';
import { ADMIN_ACTION, NEWEST_FIRST, ROW_SELECT } from '../shared/admin.config';
import { csvFile, pageWindow } from '../shared/listing.helpers';
import { paymentView } from '../shared/rows.helpers';
import { ADMIN_REFUND, PAYMENT_EXPORT } from './payments.config';
import { paymentTotals, paymentWhere } from './payments.helpers';

@Injectable()
export class AdminPaymentsService {
  private readonly logger = new Logger(AdminPaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly yookassa: YooKassaClient,
    private readonly audit: AdminAuditService
  ) {}

  async list({ page, ...filter }: PaymentQuery): Promise<AdminPaymentPage> {
    const where = paymentWhere({ filter, now: new Date() });
    const groups = await this.prisma.payment.groupBy({ by: ['status'], where, _count: { _all: true }, _sum: { amount: true } });
    const totals = paymentTotals(groups);
    const { info, skip, take } = pageWindow({ page, total: totals.count });
    const rows = await this.prisma.payment.findMany({ where, orderBy: NEWEST_FIRST, skip, take, select: ROW_SELECT.payment });

    return adminPaymentPageSchema.parse({ items: rows.map(paymentView), page: info, totals });
  }

  async exportCsv(filter: PaymentFilter): Promise<AdminCsvFile> {
    const now = new Date();

    const rows = await this.prisma.payment.findMany({
      where: paymentWhere({ filter, now }),
      orderBy: NEWEST_FIRST,
      take: ADMIN_EXPORT.maxRows + 1,
      select: ROW_SELECT.payment
    });

    return adminCsvFileSchema.parse(csvFile({ name: PAYMENT_EXPORT.file, columns: PAYMENT_EXPORT.columns, rows: rows.map(paymentView), now }));
  }

  async refund({ admin, paymentId }: RefundActionInput): Promise<AdminPayment> {
    const row = await this.prisma.payment.findUniqueOrThrow({ where: { id: paymentId }, select: ROW_SELECT.payment });

    if (row.status !== 'succeeded') {
      throw new AppBadRequestException('CONFLICT', `Only a succeeded payment can be refunded, this one is ${row.status}`);
    }

    const refund = await this.yookassa
      .createRefund({
        paymentId: row.yookassaPaymentId,
        amountRub: row.amount.toNumber(),
        description: ADMIN_REFUND.description,
        idempotenceKey: `${ADMIN_REFUND.idempotencePrefix}${row.id}`
      })
      .catch((error: unknown) => {
        this.logger.error(`admin ${admin.email} could not refund payment ${row.id}: ${describeError(error)}`);

        throw new AppBadRequestException('PAYMENT_FAILED', 'YooKassa did not accept the refund');
      });

    if (refund.status === 'canceled') {
      this.logger.warn(`admin ${admin.email} asked to refund payment ${row.id}, YooKassa canceled refund ${refund.id}`);

      throw new AppBadRequestException('PAYMENT_FAILED', 'YooKassa canceled the refund');
    }

    await this.prisma.payment.updateMany({ where: { id: row.id, status: 'succeeded' }, data: { refundRequestedAt: new Date() } });

    await this.audit.record({
      admin,
      action: ADMIN_ACTION.refund,
      summary: `refunded payment ${row.id} in full (${row.amount.toString()} RUB, refund ${refund.id} ${refund.status})`,
      targetUserId: row.user?.id,
      details: { paymentId: row.id, amount: row.amount.toNumber(), refundId: refund.id, refundStatus: refund.status }
    });

    const refunded = await this.prisma.payment.findUniqueOrThrow({ where: { id: paymentId }, select: ROW_SELECT.payment });

    return adminPaymentSchema.parse(paymentView(refunded));
  }
}
