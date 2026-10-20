import { useTranslations } from 'next-intl';

import { SITE } from '@/shared/config';
import { GnomeBadge, Text } from '@/ui-kit';

import s from './FaqFooter.module.scss';

export const FaqFooter = () => {
  const t = useTranslations('faq');

  return (
    <footer className={s.root}>
      <GnomeBadge size={52} />
      <div className={s.text}>
        <Text as='p' className={s.stuck}>
          {t('stillStuck')}
        </Text>
        <a className={s.link} href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
      </div>
    </footer>
  );
};
