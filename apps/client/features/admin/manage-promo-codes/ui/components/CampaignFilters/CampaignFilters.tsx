'use client';

import { ADMIN_CAMPAIGN_STATES, CAMPAIGN_KINDS } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { FilterBar, FilterSelect } from '@/entities/admin/records';

import type { CampaignFiltersProps } from './CampaignFilters.types';

export const CampaignFilters = ({ value, onChange }: CampaignFiltersProps) => {
  const t = useTranslations('admin.promo.campaigns');
  const common = useTranslations('admin.common');
  const id = useId();

  const any = common('filters.any');

  return (
    <FilterBar label={t('filters.label')}>
      <FilterSelect
        anyLabel={any}
        id={`${id}-state`}
        label={t('filters.state')}
        options={ADMIN_CAMPAIGN_STATES.map((state) => ({ value: state, label: t(`states.${state}`) }))}
        value={value.state}
        onChange={(state) => onChange({ state })}
      />

      <FilterSelect
        anyLabel={any}
        id={`${id}-kind`}
        label={t('filters.kind')}
        options={CAMPAIGN_KINDS.map((kind) => ({ value: kind, label: t(`filters.kinds.${kind}`) }))}
        value={value.kind}
        onChange={(kind) => onChange({ kind })}
      />
    </FilterBar>
  );
};
