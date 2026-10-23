import type { PaymentFilterState } from '../../../lib';

export type PaymentFiltersProps = {
  value: PaymentFilterState;
  onChange: (value: PaymentFilterState) => void;
};
