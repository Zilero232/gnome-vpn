'use client';

import { formatGiftCode } from '@gnomevpn/schemas';
import { Copy, Share2 } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { match, P } from 'ts-pattern';

import { DATE_FORMAT } from '@/shared/i18n';
import { Button, copyWithToast } from '@/ui-kit';

import type { GiftItemProps } from './GiftItem.types';

import { useShareGift } from '../../../model/hooks';

import s from './GiftItem.module.scss';

export const GiftItem = ({ gift }: GiftItemProps) => {
  const t = useTranslations('gifts');
  const format = useFormatter();
  const share = useShareGift();

  const code = formatGiftCode(gift.code);
  const purchasedAt = format.dateTime(new Date(gift.purchasedAt), DATE_FORMAT);
  const status = match(gift)
    .with({ revokedAt: P.string }, () => t('revoked'))
    .with({ redeemedAt: P.string }, ({ redeemedAt }) => t('redeemed', { date: format.dateTime(new Date(redeemedAt), DATE_FORMAT) }))
    .otherwise(() => t('unredeemed'));

  const isShareable = gift.redeemedAt === null && gift.revokedAt === null;

  const onCopy = () => copyWithToast({ value: code, success: t('copied'), failure: t('copyFailed') });

  return (
    <li className={s.root} data-redeemed={!isShareable}>
      <div className={s.main}>
        <button aria-label={t('copy', { code })} className={s.code} type='button' onClick={() => void onCopy()}>
          <span className={s.value}>{code}</span>
          <Copy aria-hidden size={16} />
        </button>

        <span className={s.meta}>
          {t(`plans.${gift.plan}`)} · {t('purchased', { date: purchasedAt })}
        </span>

        <span className={s.status}>{status}</span>
      </div>

      {isShareable && (
        <Button className={s.share} size='md' type='button' variant='ghost' onClick={() => void share(gift)}>
          <Share2 aria-hidden size={16} />
          {t('share')}
        </Button>
      )}
    </li>
  );
};
