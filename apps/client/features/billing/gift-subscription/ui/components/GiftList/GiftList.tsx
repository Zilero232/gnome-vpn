'use client';

import { Hourglass } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Text } from '@/ui-kit';

import { useGifts } from '../../../model/hooks';
import { GiftItem } from '../GiftItem';

import s from './GiftList.module.scss';

export const GiftList = () => {
  const t = useTranslations('gifts');
  const { data: list, isError } = useGifts();

  if (isError) {
    return (
      <Text as='p' size='xs' tone='muted'>
        {t('unavailable')}
      </Text>
    );
  }

  if (!list || (list.gifts.length === 0 && list.pendingCount === 0)) {
    return null;
  }

  return (
    <div className={s.root}>
      <Text as='h4' className={s.title}>
        {t('listTitle')}
      </Text>

      {list.pendingCount > 0 && (
        <p className={s.pending} role='status'>
          <Hourglass aria-hidden className={s.pendingIcon} size={16} />
          {t('pending')}
        </p>
      )}

      <ul className={s.list}>
        {list.gifts.map((gift) => (
          <GiftItem key={gift.code} gift={gift} />
        ))}
      </ul>
    </div>
  );
};
