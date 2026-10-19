import { BadgeCheck, CalendarPlus, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Text } from '@/ui-kit';

import type { InviteStatsProps } from './InviteStats.types';

import s from './InviteStats.module.scss';

export const InviteStats = ({ overview }: InviteStatsProps) => {
  const t = useTranslations('referrals');

  const stats = [
    { key: 'invited', icon: Users, value: overview.invited },
    { key: 'rewarded', icon: BadgeCheck, value: overview.rewarded },
    { key: 'daysEarned', icon: CalendarPlus, value: overview.daysEarned }
  ] as const;

  return (
    <section className={s.root}>
      <Text as='h3' className={s.title} size='sm'>
        {t('statsTitle')}
      </Text>

      <dl className={s.list}>
        {stats.map(({ key, icon: Icon, value }) => (
          <div key={key} className={s.stat}>
            <dt className={s.label}>
              <Icon aria-hidden size={14} />
              {t(`stats.${key}`)}
            </dt>
            <dd className={s.value}>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
