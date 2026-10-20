import { LOWEST_MONTHLY_RUB } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';

import { AUTH_MODE, QUERY_PARAMS, ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { buttonVariants, Text } from '@/ui-kit';

import { HERO_METRICS } from '../../../config';

import s from './Hero.module.scss';

export const Hero = () => {
  const t = useTranslations('landing');

  return (
    <section className={s.root}>
      <img aria-hidden alt='' className={s.mark} height={200} src='/brand/logo-mark.svg' width={200} />

      <Text as='p' className={s.eyebrow}>
        {t('eyebrow')}
      </Text>

      <Text as='h1' className={s.title}>
        {t('titleLine1')} <br />
        {t('titleLine2')} <span className={s.titleAccent}>{t('titleAccent')}</span>
      </Text>

      <Text as='p' className={s.lead}>
        {t('lead')}
      </Text>

      <div className={s.actions}>
        <Link className={buttonVariants({ size: 'md' })} href={{ pathname: ROUTES.account, query: { [QUERY_PARAMS.mode]: AUTH_MODE.signup } }}>
          {t('cta')}
        </Link>

        <Link className={buttonVariants({ size: 'md', variant: 'ghost' })} href='#how'>
          {t('ctaSecondary')}
        </Link>
      </div>

      <Text as='p' className={s.ctaNote} size='sm' tone='muted'>
        {t('ctaNote', { price: LOWEST_MONTHLY_RUB })}
      </Text>

      <dl className={s.meta}>
        {HERO_METRICS.map((metric) => (
          <div key={metric.key} className={s.metaItem}>
            <dt className={s.metaLabel}>{t(`metrics.${metric.key}`)}</dt>
            <dd className={s.metaValue}>{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
