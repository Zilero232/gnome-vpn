import type { AdminPayment } from '@gnomevpn/schemas';

import type { CsvColumn } from '../shared/admin.types';

export const PAYMENT_EXPORT = {
  file: 'gnomevpn-payments',
  columns: [
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
  ] satisfies CsvColumn<AdminPayment>[]
} as const;

export const ADMIN_REFUND = {
  idempotencePrefix: 'admin-refund-',
  description: 'GnomeVPN: refund issued by the service'
} as const;
