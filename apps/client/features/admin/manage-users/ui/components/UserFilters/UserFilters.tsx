'use client';

import { ADMIN_PERIODS, ADMIN_USER_FILTERS, periodKindSchema, PLANS } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { FilterBar, FilterSelect } from '@/entities/admin/records';

import type { UserFiltersProps } from './UserFilters.types';

export const UserFilters = ({ value, onChange }: UserFiltersProps) => {
  const t = useTranslations('admin.users.filters');
  const common = useTranslations('admin.common');
  const records = useTranslations('admin.records');
  const plans = useTranslations('plans.plans');
  const id = useId();

  const any = common('filters.any');

  return (
    <FilterBar label={t('label')}>
      <FilterSelect
        anyLabel={any}
        id={`${id}-access`}
        label={t('access')}
        options={periodKindSchema.options.map((access) => ({ value: access, label: records(`access.${access}`) }))}
        value={value.access}
        onChange={(access) => onChange({ access })}
      />

      <FilterSelect
        anyLabel={any}
        id={`${id}-plan`}
        label={t('plan')}
        options={PLANS.map((plan) => ({ value: plan.id, label: plans(plan.id) }))}
        value={value.plan}
        onChange={(plan) => onChange({ plan })}
      />

      <FilterSelect
        anyLabel={any}
        id={`${id}-renew`}
        label={t('autoRenew')}
        options={ADMIN_USER_FILTERS.autoRenew.map((renew) => ({ value: renew, label: t(`autoRenewValues.${renew}`) }))}
        value={value.autoRenew}
        onChange={(autoRenew) => onChange({ autoRenew })}
      />

      <FilterSelect
        anyLabel={any}
        id={`${id}-telegram`}
        label={t('telegram')}
        options={ADMIN_USER_FILTERS.telegram.map((state) => ({ value: state, label: t(`telegramValues.${state}`) }))}
        value={value.telegram}
        onChange={(telegram) => onChange({ telegram })}
      />

      <FilterSelect
        anyLabel={any}
        id={`${id}-email`}
        label={t('email')}
        options={ADMIN_USER_FILTERS.email.map((state) => ({ value: state, label: t(`emailValues.${state}`) }))}
        value={value.email}
        onChange={(email) => onChange({ email })}
      />

      <FilterSelect
        id={`${id}-period`}
        label={t('period')}
        options={ADMIN_PERIODS.map((period) => ({ value: period, label: common(`periods.${period}`) }))}
        value={value.period}
        onChange={(period) => onChange({ period })}
      />
    </FilterBar>
  );
};
