'use client';

import { BadgePercent } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { Button, Text } from '@/ui-kit';

import { useConsents, useUpdateMarketingConsent } from '../../model/hooks';

import s from './MarketingConsentPrompt.module.scss';

export const MarketingConsentPrompt = () => {
  const t = useTranslations('account.marketing');
  const { data: consents } = useConsents();
  const update = useUpdateMarketingConsent();
  const titleId = useId();

  if (!consents || consents.marketing !== null) {
    return null;
  }

  return (
    <section aria-labelledby={titleId} className={s.root}>
      <span aria-hidden className={s.icon}>
        <BadgePercent size={16} />
      </span>

      <div className={s.text}>
        <Text as='h3' className={s.title} id={titleId}>
          {t('promptTitle')}
        </Text>

        <Text as='p' size='xs' tone='muted'>
          {t('promptBody')}
        </Text>
      </div>

      <div className={s.actions}>
        <Button size='sm' onClick={() => update.mutate({ granted: true, source: 'account' })}>
          {t('yes')}
        </Button>

        <Button size='sm' variant='ghost' onClick={() => update.mutate({ granted: false, source: 'account' })}>
          {t('no')}
        </Button>
      </div>
    </section>
  );
};
