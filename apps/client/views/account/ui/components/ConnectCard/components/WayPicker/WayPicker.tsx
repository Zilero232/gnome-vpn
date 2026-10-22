'use client';

import { useTranslations } from 'next-intl';
import { entries } from 'remeda';

import { Badge, ChoiceGroup } from '@/ui-kit';

import type { WayPickerProps } from './WayPicker.types';

import { CONNECT_WAYS } from '../../ConnectCard.constants';

export const WayPicker = ({ value, onChange }: WayPickerProps) => {
  const t = useTranslations('account.connect');

  return (
    <ChoiceGroup
      options={entries(CONNECT_WAYS).map(([way, { icon: Icon, isRecommended }]) => ({
        value: way,
        label: t(`ways.${way}.title`),
        description: t(`ways.${way}.hint`),
        icon: <Icon />,
        badge: isRecommended && <Badge>{t('recommended')}</Badge>
      }))}
      label={t('label')}
      labelAs='h2'
      layout='cards'
      value={value}
      onChange={onChange}
    />
  );
};
