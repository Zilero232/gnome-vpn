import type { inferParserType, Nullable } from 'nuqs';

import type { PAYMENT_FILTERS } from '../../../config';

type PaymentFilterValues = inferParserType<typeof PAYMENT_FILTERS.parsers>;

export type PaymentFiltersProps = {
  value: PaymentFilterValues;
  onChange: (next: Partial<Nullable<PaymentFilterValues>>) => void;
};
