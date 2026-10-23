import type { AdminPayment, AdminUser } from '@gnomevpn/schemas';
import type { Options } from 'csv-stringify/sync';

import type { CsvColumn } from '../lib';

export const ADMIN_CSV = {
  bom: true,
  header: true,
  record_delimiter: 'windows',
  quote_record_delimiter: true,
  escape_formulas: true,
  cast: { boolean: String }
} as const satisfies Options;

export const ADMIN_EXPORT_FILE = {
  users: 'gnomevpn-users',
  payments: 'gnomevpn-payments',
  extension: '.csv'
} as const;

export const USER_CSV_COLUMNS: CsvColumn<AdminUser>[] = [
  { header: 'id', value: (user) => user.id },
  { header: 'email', value: (user) => (user.hasEmail ? user.email : null) },
  { header: 'email_verified', value: (user) => user.emailVerified },
  { header: 'created_at', value: (user) => user.createdAt },
  { header: 'access', value: (user) => user.access },
  { header: 'plan', value: (user) => user.plan },
  { header: 'period_end', value: (user) => user.currentPeriodEnd },
  { header: 'devices', value: (user) => user.devices },
  { header: 'telegram_id', value: (user) => user.telegram?.id ?? null },
  { header: 'telegram_username', value: (user) => user.telegram?.username ?? null }
];

export const PAYMENT_CSV_COLUMNS: CsvColumn<AdminPayment>[] = [
  { header: 'id', value: (payment) => payment.id },
  { header: 'yookassa_id', value: (payment) => payment.yookassaPaymentId },
  { header: 'created_at', value: (payment) => payment.createdAt },
  { header: 'user_id', value: (payment) => payment.user?.id ?? null },
  { header: 'email', value: (payment) => payment.user?.email ?? null },
  { header: 'status', value: (payment) => payment.status },
  { header: 'kind', value: (payment) => payment.kind },
  { header: 'plan', value: (payment) => payment.plan },
  { header: 'amount_rub', value: (payment) => payment.amount },
  { header: 'auto_charge', value: (payment) => payment.isAutoCharge },
  { header: 'extra_devices', value: (payment) => payment.extraDevices },
  { header: 'promo_code', value: (payment) => payment.promoCode },
  { header: 'discount_percent', value: (payment) => payment.discountPercent },
  { header: 'refund_requested_at', value: (payment) => payment.refundRequestedAt }
];
