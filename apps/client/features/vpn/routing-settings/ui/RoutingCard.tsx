'use client';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { ErrorBlock, LoadingBlock, Text } from '@/ui-kit';

import { ROUTING_TOGGLES } from '../config';
import { useRoutingSettings, useUpdateRouting } from '../model/hooks';
import { RoutingToggle } from './components';

import s from './RoutingCard.module.scss';

export const RoutingCard = () => {
  const t = useTranslations('routing');
  const { data: settings, isPending, isError, isRefetching, refetch } = useRoutingSettings();
  const update = useUpdateRouting();
  const titleId = useId();

  if (isPending) {
    return <LoadingBlock label={t('loading')} />;
  }

  if (isError) {
    return <ErrorBlock isRetrying={isRefetching} message={t('unavailable')} retryLabel={t('retry')} onRetry={() => void refetch()} />;
  }

  return (
    <section aria-labelledby={titleId} className={s.root}>
      <div className={s.header}>
        <Text as='h3' className={s.title} id={titleId} size='sm'>
          {t('title')}
        </Text>

        <Text as='p' size='xs' tone='muted'>
          {t('intro')}
        </Text>
      </div>

      <div className={s.toggles}>
        {ROUTING_TOGGLES.map(({ key, icon }) => (
          <RoutingToggle
            key={key}
            checked={settings[key]}
            hint={t(`${key}.hint`)}
            icon={icon}
            label={t(`${key}.label`)}
            onCheckedChange={(checked) => update.mutate({ [key]: checked })}
          />
        ))}
      </div>

      <Text as='p' className={s.note} size='xs' tone='muted'>
        <Info aria-hidden className={s.noteIcon} size={14} />
        {t('note')}
      </Text>
    </section>
  );
};
