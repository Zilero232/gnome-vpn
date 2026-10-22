'use client';

import { useTranslations } from 'next-intl';

import { ChoiceGroup } from '@/ui-kit';

import type { TargetPickerProps } from './TargetPicker.types';

import { WIREGUARD_TARGETS } from '../../../config';

export const TargetPicker = ({ value, onChange }: TargetPickerProps) => {
  const t = useTranslations('wireguard');

  return (
    <ChoiceGroup
      options={WIREGUARD_TARGETS.map(({ id, icon: Icon }) => ({
        value: id,
        label: t(`targets.${id}.name`),
        description: t(`targets.${id}.reach`),
        icon: <Icon />
      }))}
      columns={2}
      label={t('targetLabel')}
      value={value}
      onChange={onChange}
    />
  );
};
