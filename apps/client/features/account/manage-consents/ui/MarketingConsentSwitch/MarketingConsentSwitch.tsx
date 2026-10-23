'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { ErrorBlock, LoadingBlock, Switch } from '@/ui-kit';

import { useConsents, useUpdateMarketingConsent } from '../../model/hooks';

import s from './MarketingConsentSwitch.module.scss';

export const MarketingConsentSwitch = () => {
  const t = useTranslations('account');
  const { data: consents, isPending, isError, isRefetching, refetch } = useConsents();
  const update = useUpdateMarketingConsent();
  const id = useId();

  const switchId = `${id}-switch`;
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;

  if (isPending) {
    return <LoadingBlock label={t('loading')} />;
  }

  if (isError) {
    return <ErrorBlock isRetrying={isRefetching} message={t('marketing.unavailable')} retryLabel={t('retry')} onRetry={() => void refetch()} />;
  }

  return (
    <label className={s.root} htmlFor={switchId}>
      <span className={s.text}>
        <span className={s.label} id={labelId}>
          {t('marketing.label')}
        </span>

        <span className={s.hint} id={hintId}>
          {t('marketing.hint')}
        </span>
      </span>

      <Switch
        aria-describedby={hintId}
        aria-labelledby={labelId}
        checked={consents.marketing?.granted === true}
        id={switchId}
        onCheckedChange={(granted) => update.mutate({ granted, source: 'account' })}
      />
    </label>
  );
};
