'use client';

import { useTranslations } from 'next-intl';

import { Segmented, Text } from '@/ui-kit';

import type { PlatformPickerProps } from './PlatformPicker.types';

import { SETUP_PICKER } from '../../../config';

import s from './PlatformPicker.module.scss';

export const PlatformPicker = ({ value, onChange }: PlatformPickerProps) => {
  const t = useTranslations('setup.picker');

  return (
    <div className={s.root}>
      <Text as='span' className={s.label}>
        {t('label')}
      </Text>
      <Segmented
        aria-label={t('label')}
        className={s.control}
        options={SETUP_PICKER.map((pick) => ({ value: pick, label: t(pick) }))}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
