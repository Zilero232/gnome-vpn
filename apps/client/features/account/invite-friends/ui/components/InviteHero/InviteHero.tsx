import { MAX_REFERRER_DAYS } from '@gnomevpn/schemas';
import { Gift } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Text } from '@/ui-kit';

import s from './InviteHero.module.scss';

export const InviteHero = () => {
  const t = useTranslations('referrals');

  return (
    <header className={s.root}>
      <span className={s.eyebrow}>
        <Gift aria-hidden size={14} />
        {t('eyebrow')}
      </span>

      <Text as='h2' className={s.title}>
        {t('title')}
      </Text>

      <p className={s.headline}>
        <span className={s.upTo}>{t('upTo')}</span>
        <span className={s.value}>+{MAX_REFERRER_DAYS}</span>
        <span className={s.unit}>{t('perFriend', { days: MAX_REFERRER_DAYS })}</span>
      </p>

      <Text as='p' className={s.intro} size='sm' tone='muted'>
        {t('intro')}
      </Text>
    </header>
  );
};
