'use client';

import { Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { copyWithToast, Text } from '@/ui-kit';

import type { InviteCodeProps } from './InviteCode.types';

import s from './InviteCode.module.scss';

export const InviteCode = ({ code }: InviteCodeProps) => {
  const t = useTranslations('referrals');

  const onCopy = () => copyWithToast({ value: code, success: t('codeCopied'), failure: t('codeCopyFailed') });

  return (
    <div className={s.root}>
      <div className={s.text}>
        <Text as='h3' className={s.title} size='sm'>
          {t('codeTitle')}
        </Text>

        <Text as='p' size='xs' tone='muted'>
          {t('codeHint')}
        </Text>
      </div>

      <button aria-label={t('copyCode', { code })} className={s.code} type='button' onClick={() => void onCopy()}>
        <span className={s.value}>{code}</span>
        <Copy aria-hidden size={18} />
      </button>
    </div>
  );
};
