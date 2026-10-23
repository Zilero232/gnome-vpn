'use client';

import { useTranslations } from 'next-intl';
import { match, P } from 'ts-pattern';

import { useServerStatus } from '@/entities/vpn/node-status';
import { ErrorBlock, LoadingBlock, Text } from '@/ui-kit';

import { NodeCard } from './components';

import s from './NodeList.module.scss';

export const NodeList = () => {
  const t = useTranslations('status.nodes');
  const { data: status, isPending, isRefetching, refetch } = useServerStatus();

  return match({ isPending, status })
    .with({ isPending: true }, () => <LoadingBlock label={t('loading')} />)
    .with({ status: P.nullish }, () => (
      <ErrorBlock isRetrying={isRefetching} message={t('unavailable')} retryLabel={t('retry')} onRetry={() => void refetch()} />
    ))
    .with({ status: { nodes: [] } }, () => (
      <Text as='p' className={s.empty} tone='muted'>
        {t('empty')}
      </Text>
    ))
    .with({ status: P.select(P.nonNullable) }, ({ nodes }) => (
      <ul className={s.grid}>
        {nodes.map((node, index) => (
          <NodeCard key={`${node.countryCode}-${String(index)}`} node={node} />
        ))}
      </ul>
    ))
    .exhaustive();
};
