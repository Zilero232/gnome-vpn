import type { AdminCsvFile, AdminPayment, AdminPaymentPage } from '@gnomevpn/schemas';

import { ADMIN_EXPORT, ADMIN_PAGE, adminCsvFileSchema, adminPaymentPageSchema, adminPaymentSchema } from '@gnomevpn/schemas';
import { Injectable, Logger } from '@nestjs/common';
import { isNullish, omit } from 'remeda';

import type { PaymentExportInput, PaymentListInput, RefundActionInput } from '../admin.types';
import type { PaymentRow } from '../lib';

import { AppBadRequestException, AppNotFoundException } from '../../../common/exceptions';
import { dayKey, describeError } from '../../../common/lib';
import { PrismaService } from '../../../core';
import { YooKassaClient } from '../../../lib';
import { ADMIN_EXPORT_FILE, ADMIN_REFUND, PAYMENT_CSV_COLUMNS, PAYMENT_ORDER, PAYMENT_ROW_SELECT } from '../config';
import { pageWindow, paymentTotals, paymentView, paymentWhere, toCsv } from '../lib';

@Injectable()
export class AdminPaymentsService {
  private readonly logger = new Logger(AdminPaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly yookassa: YooKassaClient
  ) {}

  async list({ page, now, ...filter }: PaymentListInput): Promise<AdminPaymentPage> {
    const where = paymentWhere({ filter, now });
    const groups = await this.prisma.payment.groupBy({ by: ['status'], where, _count: { _all: true }, _sum: { amount: true } });
    const totals = paymentTotals(groups);
    const window = pageWindow({ page, total: totals.count, size: ADMIN_PAGE.size });

    const rows = await this.prisma.payment.findMany({
      where,
      orderBy: [...PAYMENT_ORDER],
      skip: window.skip,
      take: window.take,
      select: PAYMENT_ROW_SELECT
    });

    return adminPaymentPageSchema.parse({
      items: rows.map(paymentView),
      page: omit(window, ['skip', 'take']),
      totals
    });
  }

  async exportCsv({ now, ...filter }: PaymentExportInput): Promise<AdminCsvFile> {
    const rows = await this.prisma.payment.findMany({
      where: paymentWhere({ filter, now }),
      orderBy: [...PAYMENT_ORDER],
      take: ADMIN_EXPORT.maxRows + 1,
      select: PAYMENT_ROW_SELECT
    });

    const payments = rows.slice(0, ADMIN_EXPORT.maxRows).map(paymentView);

    return adminCsvFileSchema.parse({
      filename: `${ADMIN_EXPORT_FILE.payments}-${dayKey(now)}${ADMIN_EXPORT_FILE.extension}`,
      content: toCsv({ columns: PAYMENT_CSV_COLUMNS, rows: payments }),
      rows: payments.length,
      isTruncated: rows.length > ADMIN_EXPORT.maxRows
    });
  }

  async refund({ admin, paymentId }: RefundActionInput): Promise<AdminPayment> {
    const row = await this.find(paymentId);

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

    this.logger.log(`admin ${admin.email} refunded payment ${row.id} in full (${row.amount.toString()} RUB, refund ${refund.id} ${refund.status})`);

    return adminPaymentSchema.parse(paymentView(await this.find(paymentId)));
  }

  private async find(paymentId: string): Promise<PaymentRow> {
    const row = await this.prisma.payment.findUnique({ where: { id: paymentId }, select: PAYMENT_ROW_SELECT });

    if (isNullish(row)) {
      throw new AppNotFoundException('NOT_FOUND', 'No such payment');
    }

    return row;
  }
}
