'use client';

import { differenceInCalendarDays } from 'date-fns';
import { TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { clamp, isNonNullish } from 'remeda';

import { Text } from '@/ui-kit';

import type { RenewPanelProps } from './RenewPanel.types';

import { PlanPicker } from '../../PlanPicker';
import { RENEW_PANEL } from './RenewPanel.constants';

import s from './RenewPanel.module.scss';

export const RenewPanel = ({ subscription, hasChargeFailed = false }: RenewPanelProps) => {
  const t = useTranslations('account.renew');

  const periodEnd = subscription.currentPeriodEnd;
  const daysLeft = periodEnd ? clamp(differenceInCalendarDays(new Date(periodEnd), new Date()), { min: 0 }) : null;
  const isEndingSoon = isNonNullish(daysLeft) && daysLeft <= RENEW_PANEL.soonDays;

  return (
    <section className={s.root} data-urgent={hasChargeFailed || isEndingSoon}>
      <div className={s.head}>
        <Text as='h3' className={s.title}>
          {t('title')}
        </Text>

        <Text size='xs' tone='muted'>
          {t('hint')}
        </Text>
      </div>

      {hasChargeFailed && (
        <p className={s.alert} role='status'>
          <TriangleAlert aria-hidden className={s.alertIcon} size={16} />
          {t('chargeFailed')}
        </p>
      )}

      {!hasChargeFailed && isEndingSoon && (
        <p className={s.alert} role='status'>
          <TriangleAlert aria-hidden className={s.alertIcon} size={16} />
          {t('soon', { count: daysLeft })}
        </p>
      )}

      <PlanPicker defaultPlan={subscription.plan} intent='extend' />
    </section>
  );
};
