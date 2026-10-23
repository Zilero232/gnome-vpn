'use client';

import { ADMIN_PERIODS, paymentKindSchema, paymentStatusSchema, PLANS } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { FilterBar, FilterSelect } from '@/entities/admin/records';

import type { PaymentFiltersProps } from './PaymentFilters.types';

export const PaymentFilters = ({ value, onChange }: PaymentFiltersProps) => {
  const t = useTranslations('admin.payments');
  const common = useTranslations('admin.common');
  const plans = useTranslations('plans.plans');
  const id = useId();

  const any = common('filters.any');

  return (
    <FilterBar label={t('filters.label')}>
      <FilterSelect
        id={`${id}-period`}
        label={t('filters.period')}
        options={ADMIN_PERIODS.map((period) => ({ value: period, label: common(`periods.${period}`) }))}
        value={value.period}
        onChange={(period) => onChange({ period })}
      />

      <FilterSelect
        anyLabel={any}
        id={`${id}-status`}
        label={t('filters.status')}
        options={paymentStatusSchema.options.map((status) => ({ value: status, label: t(`statuses.${status}`) }))}
        value={value.status}
        onChange={(status) => onChange({ status })}
      />

      <FilterSelect
        anyLabel={any}
        id={`${id}-kind`}
        label={t('filters.kind')}
        options={paymentKindSchema.options.map((kind) => ({ value: kind, label: t(`kindNames.${kind}`) }))}
        value={value.kind}
        onChange={(kind) => onChange({ kind })}
      />

      <FilterSelect
        anyLabel={any}
        id={`${id}-plan`}
        label={t('filters.plan')}
        options={PLANS.map((plan) => ({ value: plan.id, label: plans(plan.id) }))}
        value={value.plan}
        onChange={(plan) => onChange({ plan })}
      />
    </FilterBar>
  );
};
