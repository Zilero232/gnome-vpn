'use client';

import { useTranslations } from 'next-intl';

import { CLIENT_ICONS } from '@/entities/app/incy';
import { Badge, ChoiceGroup } from '@/ui-kit';

import type { ClientPickerProps } from './ClientPicker.types';

export const ClientPicker = ({ clients, value, onChange }: ClientPickerProps) => {
  const t = useTranslations('incy');

  return (
    <ChoiceGroup
      options={clients.map(({ id, isRecommended }) => {
        const Icon = CLIENT_ICONS[id];

        return {
          value: id,
          label: t(`clients.${id}`),
          description: t(`clientReach.${id}`),
          icon: <Icon />,
          badge: isRecommended && <Badge>{t('recommended')}</Badge>
        };
      })}
      label={t('clientLabel')}
      value={value}
      onChange={onChange}
    />
  );
};
