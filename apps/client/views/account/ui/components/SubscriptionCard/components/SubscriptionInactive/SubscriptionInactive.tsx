'use client';

import { useFormatter, useTranslations } from 'next-intl';

import { useCurrentUser } from '@/entities/auth/user';
import { VerifyEmailCard } from '@/features/auth/verify-email';
import { PlanPicker } from '@/features/billing/checkout';
import { TrialBanner } from '@/features/billing/claim-trial';
import { DATE_FORMAT } from '@/shared/i18n';
import { Text } from '@/ui-kit';

import type { SubscriptionInactiveProps } from './SubscriptionInactive.types';

import s from './SubscriptionInactive.module.scss';

export const SubscriptionInactive = ({ subscription }: SubscriptionInactiveProps) => {
  const t = useTranslations('account');
  const format = useFormatter();
  const { user, hasRealEmail } = useCurrentUser();

  const endedAt = subscription?.currentPeriodEnd;
  const isTrialOffered = subscription?.isTrialAvailable === true;
  const needsVerification = isTrialOffered && hasRealEmail && user?.emailVerified === false;

  return (
    <>
      <div className={s.pitch}>
        <Text>{t('inactive')}</Text>

        {endedAt && (
          <Text size='xs' tone='muted'>
            {t('lapsed', { date: format.dateTime(new Date(endedAt), DATE_FORMAT) })}
          </Text>
        )}

        <Text size='xs' tone='muted'>
          {t('pitch')}
        </Text>
      </div>

      {needsVerification && <VerifyEmailCard />}

      {isTrialOffered && !needsVerification && <TrialBanner />}

      <div className={s.picker}>
        <PlanPicker />
      </div>
    </>
  );
};
