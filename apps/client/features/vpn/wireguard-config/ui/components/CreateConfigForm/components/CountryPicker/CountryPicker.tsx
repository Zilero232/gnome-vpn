'use client';

import { useTranslations } from 'next-intl';

import { ChoiceGroup, CountryFlag } from '@/ui-kit';

import type { CountryPickerProps } from './CountryPicker.types';

import { useCountryName } from '../../../../../model/hooks';

import s from './CountryPicker.module.scss';

export const CountryPicker = ({ nodes, selected, onSelect }: CountryPickerProps) => {
  const t = useTranslations('wireguard');
  const countryName = useCountryName();

  return (
    <ChoiceGroup
      options={nodes.map((node) => ({
        value: node.id,
        label: countryName(node),
        description: node.isDown ? <span className={s.down}>{t('serverDown')}</span> : node.city,
        icon: <CountryFlag countryCode={node.countryCode} size='md' />,
        isDisabled: node.isDown
      }))}
      label={t('countryLabel')}
      value={selected}
      onChange={onSelect}
    />
  );
};
