'use client';

import type { ClientId } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { ErrorBlock, LoadingBlock } from '@/ui-kit';

import { useSubscriptionLink } from '../model/hooks';
import { ClientPicker, LinkSteps, RotateLink } from './components';

import s from './IncyCard.module.scss';

export const IncyCard = () => {
  const t = useTranslations('incy');
  const { data: link, isPending, isError, isRefetching, refetch } = useSubscriptionLink();

  const [picked, setPicked] = useState<ClientId | null>(null);

  if (isPending) {
    return <LoadingBlock label={t('loading')} />;
  }

  if (isError) {
    return <ErrorBlock isRetrying={isRefetching} message={t('unavailable')} retryLabel={t('retry')} onRetry={() => void refetch()} />;
  }

  const client = link.clients.find(({ id }) => id === picked) ?? link.clients.find(({ isRecommended }) => isRecommended) ?? link.clients.at(0);

  return (
    <div className={s.root}>
      {client && (
        <>
          <ClientPicker clients={link.clients} value={client.id} onChange={setPicked} />

          <LinkSteps client={client} />
        </>
      )}

      <Link className={s.setupLink} href={ROUTES.setup}>
        {t('setupLink')}
      </Link>

      <RotateLink />
    </div>
  );
};
