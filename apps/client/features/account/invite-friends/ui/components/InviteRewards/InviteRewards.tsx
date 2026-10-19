import { MAX_REFERRER_DAYS, PLANS, referralReward } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';

import { Text } from '@/ui-kit';

import s from './InviteRewards.module.scss';

export const InviteRewards = () => {
  const t = useTranslations('referrals');
  const plans = useTranslations('plans');

  return (
    <section className={s.root}>
      <Text as='h3' className={s.title} size='sm'>
        {t('rewardsTitle')}
      </Text>

      <ul className={s.list}>
        {PLANS.map((plan) => {
          const reward = referralReward(plan.id);
          const isBest = reward.referrerDays === MAX_REFERRER_DAYS;

          return (
            <li key={plan.id} className={s.card} data-best={isBest}>
              <span className={s.head}>
                <span className={s.plan}>{plans(`plans.${plan.id}`)}</span>
                {isBest && <span className={s.best}>{t('rewardBest')}</span>}
              </span>

              <span className={s.you}>
                <span className={s.youLabel}>{t('rewardYouLabel')}</span>
                <span className={s.youValue}>{t('rewardYou', { days: reward.referrerDays })}</span>
              </span>

              <span className={s.friend}>{t('rewardFriend', { days: reward.friendDays })}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
