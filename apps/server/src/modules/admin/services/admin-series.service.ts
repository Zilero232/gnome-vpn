import type { AdminDay } from '@gnomevpn/schemas';

import { Injectable } from '@nestjs/common';

import type { DaysInput, PaymentDayRow } from '../admin.types';
import type { DayRow } from '../lib';

import { dayKeys } from '../../../common/lib';
import { PrismaService } from '../../../core';
import { buildDays } from '../lib';

@Injectable()
export class AdminSeriesService {
  constructor(private readonly prisma: PrismaService) {}

  async days({ start, days }: DaysInput): Promise<AdminDay[]> {
    const [payments, signups, trials, newPaid] = await Promise.all([
      this.prisma.$queryRaw<PaymentDayRow[]>`
        SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
               count(*)::int AS payments,
               coalesce(sum(amount), 0)::float8 AS revenue
        FROM payment
        WHERE status = 'succeeded' AND created_at >= ${start}
        GROUP BY 1`,
      this.prisma.$queryRaw<DayRow[]>`
        SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day, count(*)::int AS value
        FROM "user"
        WHERE created_at >= ${start}
        GROUP BY 1`,
      this.prisma.$queryRaw<DayRow[]>`
        SELECT to_char(date_trunc('day', trial_started_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day, count(*)::int AS value
        FROM subscription
        WHERE trial_started_at >= ${start}
        GROUP BY 1`,
      this.prisma.$queryRaw<DayRow[]>`
        SELECT to_char(date_trunc('day', first_paid_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day, count(*)::int AS value
        FROM (
          SELECT min(created_at) AS first_paid_at
          FROM payment
          WHERE status = 'succeeded' AND kind = 'subscription' AND user_id IS NOT NULL
          GROUP BY user_id
        ) AS first_payments
        WHERE first_paid_at >= ${start}
        GROUP BY 1`
    ]);

    return buildDays({
      keys: dayKeys({ start, days }),
      series: {
        revenue: payments.map((row) => ({ day: row.day, value: row.revenue })),
        payments: payments.map((row) => ({ day: row.day, value: row.payments })),
        signups,
        trials,
        newPaid
      }
    });
  }
}
