import { DEFAULT_DEVICE_LIMIT } from '@gnomevpn/schemas';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { CountryFlag, Reveal, Text } from '@/ui-kit';

import { INSIDE_POINTS, LOCATIONS } from '../../../config';
import { GlobeStage } from './components';

import s from './ServersInside.module.scss';

export const ServersInside = () => {
  const t = useTranslations('landing');

  return (
    <section aria-labelledby='inside-title' className={s.root} id='servers'>
      <div className={s.map}>
        <GlobeStage />

        <ul className={s.places}>
          {LOCATIONS.map((location) => (
            <li key={location.code} className={s.place}>
              <CountryFlag className={s.flag} countryCode={location.code} size='lg' />
              <span className={s.country}>{t(`locations.${location.key}Name`)}</span>
              <span className={s.city}>{t(`locations.${location.key}City`)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={s.text}>
        <Reveal className={s.head}>
          <Text as='h2' className={s.title} id='inside-title'>
            {t('inside.title')}
          </Text>
          <Text as='p' className={s.intro}>
            {t('inside.intro')}
          </Text>
        </Reveal>

        <Reveal as='ul' className={s.points} kind='group'>
          {INSIDE_POINTS.map(({ key, icon: Icon }) => (
            <Reveal key={key} as='li' className={s.point} kind='item'>
              <Icon aria-hidden className={s.icon} size={22} strokeWidth={1.6} />
              <div className={s.pointText}>
                <Text as='h3' className={s.pointTitle}>
                  {t(`inside.points.${key}.title`, { count: DEFAULT_DEVICE_LIMIT })}
                </Text>
                <Text as='p' className={s.pointBody}>
                  {t(`inside.points.${key}.body`)}
                </Text>
              </div>
            </Reveal>
          ))}
        </Reveal>

        <Link className={s.more} href={ROUTES.servers}>
          {t('inside.more')}
          <ArrowRight aria-hidden size={16} />
        </Link>
      </div>
    </section>
  );
};
