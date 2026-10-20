'use client';

import { useFormatter, useTranslations } from 'next-intl';

import { useCurrentUser } from '@/entities/auth/user';
import { VerifyEmailCard } from '@/features/auth/verify-email';
import { PlanPicker } from '@/features/billing/checkout';
import { TrialBanner } from '@/features/billing/claim-trial';
import { DATE_FORMAT } from '@/shared/i18n';
import { Text } from '@/ui-kit';

import type { SubscriptionInactiveProps } from './SubscriptionInactive.types';

import { PlansDisclosure } from '../PlansDisclosure';

import s from './SubscriptionInactive.module.scss';

export const SubscriptionInactive = ({ subscription }: SubscriptionInactiveProps) => {
  const t = useTranslations('account');
  const format = useFormatter();
  const { user, hasRealEmail } = useCurrentUser();

  const endedAt = subscription?.currentPeriodEnd;
  const isTrialOffered = subscription?.isTrialAvailable === true;
  const needsVerification = isTrialOffered && hasRealEmail && user?.emailVerified === false;

  if (isTrialOffered) {
    return (
      <>
        {needsVerification ? <VerifyEmailCard /> : <TrialBanner />}

        <PlansDisclosure />
      </>
    );
  }

  return (
    <>
      <div className={s.text}>
        <Text as='h2' className={s.title}>
          {t('inactive')}
        </Text>

        {endedAt && (
          <Text size='sm' tone='muted'>
            {t('lapsed', { date: format.dateTime(new Date(endedAt), DATE_FORMAT) })}
          </Text>
        )}

        <Text size='sm' tone='muted'>
          {t('pitch')}
        </Text>
      </div>

      <div className={s.picker}>
        <PlanPicker />
      </div>
    </>
  );
};
