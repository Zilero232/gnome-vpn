'use client';

import { ADMIN_PERIODS, paymentKindSchema, paymentStatusSchema, PLANS } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import type { PaymentFiltersProps } from './PaymentFilters.types';

import { PAYMENT_FILTER } from '../../../config';
import { FilterSelect } from '../FilterSelect';

import s from './PaymentFilters.module.scss';

export const PaymentFilters = ({ value, onChange }: PaymentFiltersProps) => {
  const t = useTranslations('admin.payments');
  const plans = useTranslations('plans.plans');
  const id = useId();

  const any = { value: PAYMENT_FILTER.any, label: t('filters.any') } as const;

  return (
    <div aria-label={t('filters.label')} className={s.root} role='group'>
      <FilterSelect
        id={`${id}-period`}
        label={t('filters.period')}
        options={ADMIN_PERIODS.map((period) => ({ value: period, label: t(`periods.${period}`) }))}
        value={value.period}
        onChange={(period) => onChange({ ...value, period })}
      />

      <FilterSelect
        id={`${id}-status`}
        label={t('filters.status')}
        options={[any, ...paymentStatusSchema.options.map((status) => ({ value: status, label: t(`statuses.${status}`) }))]}
        value={value.status}
        onChange={(status) => onChange({ ...value, status })}
      />

      <FilterSelect
        id={`${id}-kind`}
        label={t('filters.kind')}
        options={[any, ...paymentKindSchema.options.map((kind) => ({ value: kind, label: t(`kindNames.${kind}`) }))]}
        value={value.kind}
        onChange={(kind) => onChange({ ...value, kind })}
      />

      <FilterSelect
        id={`${id}-plan`}
        label={t('filters.plan')}
        options={[any, ...PLANS.map((plan) => ({ value: plan.id, label: plans(plan.id) }))]}
        value={value.plan}
        onChange={(plan) => onChange({ ...value, plan })}
      />
    </div>
  );
};
