'use client';

import { useTranslations } from 'next-intl';
import { match, P } from 'ts-pattern';

import { OfferNote, PaymentMethodsNote } from '@/entities/billing/payment-notes';
import { hasAutoChargeFailed, isAutoRenewActive } from '@/entities/billing/subscription';
import { PromoCodeForm } from '@/features/account/invite-friends';
import { AutoRenewControl, PendingCheckoutBanner, PlanPicker, RenewPanel, usePendingDiscount } from '@/features/billing/checkout';
import { GiftPanel } from '@/features/billing/gift-subscription';
import { ErrorBlock, LoadingBlock, Text } from '@/ui-kit';

import type { SubscriptionCardProps } from './SubscriptionCard.types';

import { SubscriptionHero, SubscriptionInactive } from './components';

import s from './SubscriptionCard.module.scss';

export const SubscriptionCard = ({ subscription, isLoading, isError, onRetry }: SubscriptionCardProps) => {
  const t = useTranslations('account');
  const discount = usePendingDiscount();

  const isUnavailable = isError && !subscription;

  const content = match({ isLoading, isUnavailable, subscription })
    .with({ isLoading: true }, () => <LoadingBlock label={t('loading')} />)
    .with({ isUnavailable: true }, () => <ErrorBlock message={t('unavailable')} retryLabel={t('retry')} onRetry={onRetry} />)
    .with({ subscription: P.select({ period: 'paid' }) }, (paid) => (
      <>
        <SubscriptionHero subscription={paid} />

        <AutoRenewControl subscription={paid} />

        {(!isAutoRenewActive(paid) || discount !== null) && <RenewPanel hasChargeFailed={hasAutoChargeFailed(paid)} subscription={paid} />}
      </>
    ))
    .with({ subscription: P.select({ period: 'trial' }) }, (trial) => (
      <>
        <SubscriptionHero subscription={trial} />

        <div className={s.upgrade}>
          <Text size='xs' tone='muted'>
            {t('trialUpgrade')}
          </Text>

          <PlanPicker />
        </div>
      </>
    ))
    .otherwise(() => <SubscriptionInactive subscription={subscription} />);

  return (
    <>
      <PendingCheckoutBanner />

      {content}

      {subscription && (
        <>
          <PromoCodeForm />

          <GiftPanel />

          <div className={s.notes}>
            <PaymentMethodsNote />

            <OfferNote kind='payment' />
          </div>
        </>
      )}
    </>
  );
};
