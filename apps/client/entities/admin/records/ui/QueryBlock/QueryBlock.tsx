'use client';

import { useTranslations } from 'next-intl';
import { isNonNullish } from 'remeda';

import { ErrorBlock, LoadingBlock } from '@/ui-kit';

import type { QueryBlockProps } from './QueryBlock.types';

export const QueryBlock = <Data,>({ data, isPending, isRetrying, onRetry, children }: QueryBlockProps<Data>) => {
  const t = useTranslations('admin.common');

  if (isNonNullish(data)) {
    return children(data);
  }

  return isPending ? (
    <LoadingBlock label={t('loading')} />
  ) : (
    <ErrorBlock isRetrying={isRetrying} message={t('unavailable')} retryLabel={t('retry')} onRetry={onRetry} />
  );
};
