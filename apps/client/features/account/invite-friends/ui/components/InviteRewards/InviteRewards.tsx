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
        {t('stepsTitle')}
      </Text>

      <Text as='p' className={s.hint}>
        {t('rewardsHint')}
      </Text>

      <table className={s.table}>
        <thead>
          <tr>
            <th scope='col'>{t('rewardPlanLabel')}</th>
            <th scope='col'>{t('rewardYouLabel')}</th>
            <th scope='col'>{t('rewardFriendLabel')}</th>
          </tr>
        </thead>
        <tbody>
          {PLANS.map((plan) => {
            const reward = referralReward(plan.id);
            const isBest = reward.referrerDays === MAX_REFERRER_DAYS;

            return (
              <tr key={plan.id} data-best={isBest}>
                <th scope='row'>
                  {plans(`plans.${plan.id}`)}
                  {isBest && <span className={s.best}>{t('rewardBest')}</span>}
                </th>
                <td className={s.you}>{t('rewardYou', { days: reward.referrerDays })}</td>
                <td>{t('rewardFriend', { days: reward.friendDays })}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};
