'use client';

import { useTranslations } from 'next-intl';

import { AccessBadge, useAdminFormat } from '@/entities/admin/records';
import { FactList } from '@/ui-kit';

import type { SubscriptionFactsProps } from './SubscriptionFacts.types';

export const SubscriptionFacts = ({ subscription }: SubscriptionFactsProps) => {
  const t = useTranslations('admin.user.subscription');
  const plans = useTranslations('plans.plans');
  const format = useAdminFormat();

  const renewal = subscription.isAutoRenewOn ? t('renewal.on', { card: subscription.savedCardTitle ?? '—' }) : t('renewal.off');

  return (
    <FactList
      items={[
        { key: 'access', label: t('access'), value: <AccessBadge access={subscription.access} /> },
        { key: 'plan', label: t('plan'), value: plans(subscription.plan) },
        { key: 'end', label: t('end'), value: subscription.currentPeriodEnd ? format.dateTime(subscription.currentPeriodEnd) : '—' },
        { key: 'renewal', label: t('renewal.label'), value: renewal },
        { key: 'extras', label: t('extras'), value: format.count(subscription.extraDevices) },
        { key: 'bonus', label: t('bonus'), value: format.count(subscription.bonusDays) },
        { key: 'trial', label: t('trial'), value: subscription.trialStartedAt ? format.dateTime(subscription.trialStartedAt) : t('noTrial') }
      ]}
    />
  );
};
