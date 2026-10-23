import type { AdminPaymentFilter } from '@gnomevpn/schemas';

import type { PaymentFilterState } from './payment-filter.types';

export const paymentFilterQuery = ({ status, kind, plan, period }: PaymentFilterState): AdminPaymentFilter => ({
  period,
  ...(status !== '' && { status }),
  ...(kind !== '' && { kind }),
  ...(plan !== '' && { plan })
});
