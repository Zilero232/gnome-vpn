'use client';

import { useTranslations } from 'next-intl';

import { ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { Text } from '@/ui-kit';

import type { OfferNoteProps } from './OfferNote.types';

import s from './OfferNote.module.scss';

export const OfferNote = ({ kind, className }: OfferNoteProps) => {
  const t = useTranslations('terms.notes');

  return (
    <Text className={className} size='xs' tone='muted'>
      {t.rich(kind, {
        terms: (chunks) => (
          <Link className={s.link} href={ROUTES.terms}>
            {chunks}
          </Link>
        )
      })}
    </Text>
  );
};
