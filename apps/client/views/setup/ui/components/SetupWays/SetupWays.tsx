import { useTranslations } from 'next-intl';

import { SETUP_WAYS } from '../../../config';

import s from './SetupWays.module.scss';

export const SetupWays = () => {
  const t = useTranslations('setup');

  return (
    <nav aria-label={t('ways.title')} className={s.root}>
      <ul className={s.list}>
        {SETUP_WAYS.map(({ id, icon: Icon, isRecommended }) => (
          <li key={id}>
            <a className={s.way} data-recommended={isRecommended} href={`#${id}`}>
              <span className={s.head}>
                <Icon aria-hidden className={s.icon} size={20} />
                {isRecommended && <span className={s.badge}>{t('ways.recommended')}</span>}
              </span>

              <span className={s.title}>{t(`ways.${id}.title`)}</span>
              <span className={s.body}>{t(`ways.${id}.body`)}</span>
              <span className={s.go}>
                {t('ways.go')} <span aria-hidden>↓</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
