import { DEFAULT_DEVICE_LIMIT, LOWEST_MONTHLY_RUB } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';

import { AUTH_MODE, QUERY_PARAMS, ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { buttonVariants, Text } from '@/ui-kit';

import { HERO_FACTS } from '../../../config';
import { HeroScene } from './components';

import s from './Hero.module.scss';

export const Hero = () => {
  const t = useTranslations('landing');

  return (
    <section className={s.root}>
      <div className={s.text}>
        <Text as='h1' className={s.title}>
          {t('titleStart')} <span className={s.accent}>{t('titleAccent')}</span> {t('titleEnd')}
        </Text>

        <Text as='p' className={s.lead}>
          {t('lead')}
        </Text>

        <div className={s.actions}>
          <Link
            className={buttonVariants({ size: 'md', class: s.cta })}
            href={{ pathname: ROUTES.account, query: { [QUERY_PARAMS.mode]: AUTH_MODE.signup } }}
          >
            {t('cta')}
          </Link>

          <Link className={buttonVariants({ size: 'md', variant: 'ghost', class: s.cta })} href='#how'>
            {t('ctaSecondary')}
          </Link>
        </div>

        <ul aria-label={t('facts.label')} className={s.facts}>
          {HERO_FACTS.map((fact) => (
            <li key={fact} className={s.fact}>
              {t(`facts.${fact}`, { price: LOWEST_MONTHLY_RUB, count: DEFAULT_DEVICE_LIMIT })}
            </li>
          ))}
        </ul>
      </div>

      <div className={s.art}>
        <HeroScene />
      </div>
    </section>
  );
};
