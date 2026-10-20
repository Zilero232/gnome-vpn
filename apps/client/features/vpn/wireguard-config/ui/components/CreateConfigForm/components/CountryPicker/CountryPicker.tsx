'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { CountryFlag, SelectableCard } from '@/ui-kit';

import type { CountryPickerProps } from './CountryPicker.types';

import { useCountryName } from '../../../../../model/hooks';

import s from './CountryPicker.module.scss';

export const CountryPicker = ({ nodes, selected, onSelect }: CountryPickerProps) => {
  const t = useTranslations('wireguard');
  const countryName = useCountryName();
  const labelId = useId();

  return (
    <div aria-labelledby={labelId} className={s.root} role='group'>
      <span className={s.label} id={labelId}>
        {t('countryLabel')}
      </span>

      <div className={s.list}>
        {nodes.map((node) => (
          <SelectableCard
            key={node.id}
            className={s.option}
            disabled={node.isDown}
            isSelected={selected === node.id}
            size='sm'
            type='button'
            onClick={() => onSelect(node.id)}
          >
            <CountryFlag countryCode={node.countryCode} size='md' />

            <span className={s.text}>
              <span className={s.name}>{countryName(node)}</span>
              {node.isDown ? <span className={s.down}>{t('serverDown')}</span> : node.city && <span className={s.city}>{node.city}</span>}
            </span>
          </SelectableCard>
        ))}
      </div>
    </div>
  );
};
