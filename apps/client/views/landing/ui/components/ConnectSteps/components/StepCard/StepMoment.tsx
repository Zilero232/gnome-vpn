import { Download, Link2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { match } from 'ts-pattern';

import { ACCOUNT_TAB, AUTH_MODE, QUERY_PARAMS, ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { buttonVariants } from '@/ui-kit';

import type { StepCardProps } from './StepCard.types';

import s from './StepCard.module.scss';

export const StepMoment = ({ platform, step }: Omit<StepCardProps, 'index'>) => {
  const t = useTranslations('landing.connect');
  const tIncy = useTranslations('incy');

  return match(step)
    .with('install', () => (
      <a className={s.download} href={platform.href} rel='noopener noreferrer' target='_blank'>
        <Download aria-hidden size={16} strokeWidth={2} />
        <span>
          {t('download')}
          <span className={s.hint}>{tIncy(`downloads.${platform.id}`)}</span>
        </span>
      </a>
    ))
    .with('copyLink', () => (
      <Link
        className={buttonVariants({ size: 'md', class: s.getLink })}
        href={{ pathname: ROUTES.account, query: { [QUERY_PARAMS.mode]: AUTH_MODE.signup }, hash: ACCOUNT_TAB.connect }}
      >
        <Link2 aria-hidden size={16} strokeWidth={2} />
        {t('getLink')}
      </Link>
    ))
    .with('import', () => (
      <span aria-hidden className={s.connected}>
        <span className={s.switch} />
        {t('connected')}
      </span>
    ))
    .exhaustive();
};
