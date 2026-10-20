'use client';

import { CreditCard, Gift, MonitorSmartphone, Plug, Send, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { useSubscriptionStatus } from '@/entities/billing/subscription';
import { InvitePanel, useClaimPendingReferral } from '@/features/account/invite-friends';
import { SignOutButton } from '@/features/auth/sign-out';
import { useTelegramWidget } from '@/features/auth/telegram-sign-in';
import { useVerifyEmailOutcome } from '@/features/auth/verify-email';
import { ACCOUNT_TAB } from '@/shared/constants';

import type { AccountTab } from './components';

import { BLOCK_MOTION, HEADER_MOTION, PAGE_MOTION } from './AccountPage.motion';
import { AccountIdentity, AccountTabs, ConnectCard, DevicesCard, ProfileCard, SubscriptionCard, SupportCard, TelegramCard } from './components';

import s from './AccountPage.module.scss';

export const AccountPage = () => {
  const t = useTranslations('account');
  const { subscription, isLoading, isError, isUnavailable, refetch, hasAccess } = useSubscriptionStatus();
  const { data: widget } = useTelegramWidget();

  useVerifyEmailOutcome();
  useClaimPendingReferral();

  const devicesTab: AccountTab = { value: ACCOUNT_TAB.devices, label: t('tabs.devices'), icon: MonitorSmartphone, render: () => <DevicesCard /> };
  const telegramTab: AccountTab = { value: ACCOUNT_TAB.telegram, label: t('tabs.telegram'), icon: Send, render: () => <TelegramCard /> };

  const tabs: AccountTab[] = [
    {
      value: ACCOUNT_TAB.subscription,
      label: t('tabs.subscription'),
      icon: CreditCard,
      render: () => <SubscriptionCard isError={isError} isLoading={isLoading} subscription={subscription} onRetry={() => void refetch()} />
    },
    {
      value: ACCOUNT_TAB.connect,
      label: t('tabs.connect'),
      icon: Plug,
      aliases: [ACCOUNT_TAB.wireguard, ACCOUNT_TAB.app],
      render: () => <ConnectCard hasAccess={hasAccess} isLoading={isLoading} isUnavailable={isUnavailable} onRetry={() => void refetch()} />
    },
    ...(hasAccess || isUnavailable ? [devicesTab] : []),
    { value: ACCOUNT_TAB.invite, label: t('tabs.invite'), icon: Gift, render: () => <InvitePanel /> },
    { value: ACCOUNT_TAB.profile, label: t('profile.title'), icon: UserRound, render: () => <ProfileCard /> },
    ...(widget?.botUsername ? [telegramTab] : [])
  ];

  return (
    <motion.main animate='visible' className={s.root} initial='hidden' variants={PAGE_MOTION}>
      <motion.header className={s.header} variants={HEADER_MOTION}>
        <AccountIdentity />

        <SignOutButton className={s.signOut} />
      </motion.header>

      <motion.div className={s.body} variants={BLOCK_MOTION}>
        <AccountTabs items={tabs} label={t('tabs.label')} panelClassName={s.card} />
      </motion.div>

      <motion.div variants={BLOCK_MOTION}>
        <SupportCard />
      </motion.div>

      <SignOutButton className={s.signOutBottom} variant='block' />
    </motion.main>
  );
};
