'use client';

import { ADMIN_GIFT_STATES } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { FilterBar, FilterSelect } from '@/entities/admin/records';

import type { GiftFiltersProps } from './GiftFilters.types';

export const GiftFilters = ({ value, onChange }: GiftFiltersProps) => {
  const t = useTranslations('admin.promo.gifts');
  const common = useTranslations('admin.common');
  const id = useId();

  const any = common('filters.any');

  return (
    <FilterBar label={t('filters.label')}>
      <FilterSelect
        anyLabel={any}
        id={`${id}-state`}
        label={t('filters.state')}
        options={ADMIN_GIFT_STATES.map((state) => ({ value: state, label: t(`states.${state}`) }))}
        value={value.state}
        onChange={(state) => onChange({ state })}
      />
    </FilterBar>
  );
};
