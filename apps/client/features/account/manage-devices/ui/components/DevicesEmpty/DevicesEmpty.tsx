'use client';

import { useTranslations } from 'next-intl';

import { Text } from '@/ui-kit';

import s from './DevicesEmpty.module.scss';

export const DevicesEmpty = () => {
  const t = useTranslations('devices');

  return (
    <div className={s.empty}>
      <Text size='sm' weight='semibold'>
        {t('emptyTitle')}
      </Text>

      <Text size='xs' tone='muted'>
        {t('emptyBody')}
      </Text>
    </div>
  );
};
