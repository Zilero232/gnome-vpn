'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { getTelegramWidget } from '@/shared/api';
import { QUERY_KEYS } from '@/shared/constants';

import type { FooterTelegramProps } from './FooterTelegram.types';

import { TELEGRAM_BASE } from './FooterTelegram.constants';

export const FooterTelegram = ({ className }: FooterTelegramProps) => {
  const t = useTranslations('footer');
  const { data: widget } = useQuery({
    queryKey: QUERY_KEYS.telegramWidget(),
    queryFn: getTelegramWidget,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY
  });

  if (!widget?.botUsername) {
    return null;
  }

  return (
    <a className={className} href={`${TELEGRAM_BASE}/${widget.botUsername.replace(/^@/u, '')}`} rel='noreferrer' target='_blank'>
      {t('telegram')}
    </a>
  );
};
