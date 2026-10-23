import { ADMIN_PAYMENTS } from '@gnomevpn/schemas';

import type { PaymentFilterState } from '../lib';

export const PAYMENT_FILTER = {
  initial: { status: '', kind: '', plan: '', period: ADMIN_PAYMENTS.defaultPeriod },
  any: ''
} as const satisfies { initial: PaymentFilterState; any: '' };
