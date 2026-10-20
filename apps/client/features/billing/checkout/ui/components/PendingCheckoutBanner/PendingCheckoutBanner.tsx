'use client';

import { Hourglass } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button, Text } from '@/ui-kit';

import { usePendingCheckout } from '../../../model/hooks';

import s from './PendingCheckoutBanner.module.scss';

export const PendingCheckoutBanner = () => {
  const t = useTranslations('account.pending');
  const { isPending, dismiss } = usePendingCheckout();

  if (!isPending) {
    return null;
  }

  return (
    <div className={s.root} role='status'>
      <Hourglass aria-hidden className={s.icon} size={18} />

      <div className={s.body}>
        <Text as='p' className={s.title}>
          {t('title')}
        </Text>

        <Text size='xs' tone='muted'>
          {t('body')}
        </Text>
      </div>

      <Button className={s.action} size='md' variant='ghost' onClick={dismiss}>
        {t('cancel')}
      </Button>
    </div>
  );
};
