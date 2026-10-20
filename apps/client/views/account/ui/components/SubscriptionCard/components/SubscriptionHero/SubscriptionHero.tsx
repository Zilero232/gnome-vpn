'use client';

import { differenceInCalendarDays, differenceInHours } from 'date-fns';
import { CalendarClock } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { clamp, isNonNullish } from 'remeda';

import { DATE_FORMAT } from '@/shared/i18n';
import { Text } from '@/ui-kit';

import type { SubscriptionHeroProps } from './SubscriptionHero.types';

import { SUBSCRIPTION_HERO } from './SubscriptionHero.constants';

import s from './SubscriptionHero.module.scss';

export const SubscriptionHero = ({ subscription }: SubscriptionHeroProps) => {
  const t = useTranslations('account');
  const format = useFormatter();

  const periodEnd = subscription.currentPeriodEnd;
  const now = new Date();
  const hoursLeft = periodEnd ? clamp(differenceInHours(new Date(periodEnd), now, { roundingMethod: 'ceil' }), { min: 0 }) : null;
  const daysLeft = periodEnd ? clamp(differenceInCalendarDays(new Date(periodEnd), now), { min: 0 }) : null;
  const isCountedInHours = isNonNullish(hoursLeft) && hoursLeft < SUBSCRIPTION_HERO.hoursBelow;
  const planName = subscription.period === 'trial' ? t('trialPeriod') : t(`plans.${subscription.plan}`);

  return (
    <div className={s.hero}>
      <div className={s.heroMain}>
        <Text as='span' className={s.status}>
          <span aria-hidden className={s.dot} />
          {t('active')}
        </Text>

        {isCountedInHours && (
          <p className={s.countdown}>
            <span className={s.countdownValue}>{hoursLeft}</span>
            <span className={s.countdownUnit}>{t('hoursLeft', { count: hoursLeft })}</span>
          </p>
        )}

        {!isCountedInHours && isNonNullish(daysLeft) && (
          <p className={s.countdown}>
            <span className={s.countdownValue}>{daysLeft}</span>
            <span className={s.countdownUnit}>{t('daysLeft', { count: daysLeft })}</span>
          </p>
        )}
      </div>

      <dl className={s.meta}>
        <div className={s.metaItem}>
          <dt className={s.label}>{t('planLabel')}</dt>
          <dd className={s.value}>{planName}</dd>
        </div>

        {periodEnd && (
          <div className={s.metaItem}>
            <dt className={s.label}>
              <CalendarClock aria-hidden size={13} />
              {t('untilLabel')}
            </dt>
            <dd className={s.value}>{format.dateTime(new Date(periodEnd), DATE_FORMAT)}</dd>
          </div>
        )}
      </dl>
    </div>
  );
};
