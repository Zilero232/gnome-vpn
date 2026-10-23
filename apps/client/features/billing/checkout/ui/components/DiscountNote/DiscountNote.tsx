'use client';

import { Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Text } from '@/ui-kit';

import type { DiscountNoteProps } from './DiscountNote.types';

import s from './DiscountNote.module.scss';

export const DiscountNote = ({ discount }: DiscountNoteProps) => {
  const t = useTranslations('account.plans');

  return (
    <div className={s.root} role='status'>
      <Tag aria-hidden className={s.icon} size={16} />

      <div className={s.text}>
        <Text as='p' className={s.title}>
          {t('discountNote', { percent: discount.percent, code: discount.code })}
        </Text>

        <Text as='p' size='xs' tone='muted'>
          {t('discountHint')}
        </Text>
      </div>
    </div>
  );
};
