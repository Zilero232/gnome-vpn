'use client';

import { CreditCard, Gift, MonitorSmartphone, Plug, Send, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import type { PageTab } from '@/ui-kit';

import { useSubscriptionStatus } from '@/entities/billing/subscription';
import { InvitePanel, useClaimPendingPromoCode } from '@/features/account/invite-friends';
import { useRecordPendingConsent } from '@/features/account/manage-consents';
import { SignOutButton } from '@/features/auth/sign-out';
import { useTelegramWidget } from '@/features/auth/telegram-sign-in';
import { useVerifyEmailOutcome } from '@/features/auth/verify-email';
import { ACCOUNT_TAB } from '@/shared/constants';
import { PageTabs } from '@/ui-kit';

import { BLOCK_MOTION, HEADER_MOTION, PAGE_MOTION } from './AccountPage.motion';
import { AccountIdentity, AdminLink, ConnectCard, DevicesCard, SettingsCard, SubscriptionCard, SupportCard, TelegramCard } from './components';

import s from './AccountPage.module.scss';

export const AccountPage = () => {
  const t = useTranslations('account');
  const { subscription, isLoading, isError, isUnavailable, refetch, hasAccess } = useSubscriptionStatus();
  const { data: widget } = useTelegramWidget();

  useVerifyEmailOutcome();
  useClaimPendingPromoCode();
  useRecordPendingConsent();

  const devicesTab: PageTab = { value: ACCOUNT_TAB.devices, label: t('tabs.devices'), icon: MonitorSmartphone, render: () => <DevicesCard /> };
  const telegramTab: PageTab = { value: ACCOUNT_TAB.telegram, label: t('tabs.telegram'), icon: Send, render: () => <TelegramCard /> };

  const tabs: PageTab[] = [
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
    { value: ACCOUNT_TAB.settings, label: t('tabs.settings'), icon: Settings, aliases: [ACCOUNT_TAB.profile], render: () => <SettingsCard /> },
    ...(widget?.botUsername ? [telegramTab] : [])
  ];

  return (
    <motion.main animate='visible' className={s.root} initial='hidden' variants={PAGE_MOTION}>
      <motion.header className={s.header} variants={HEADER_MOTION}>
        <AccountIdentity />

        <div className={s.actions}>
          <AdminLink />

          <div className={s.signOut}>
            <SignOutButton />
          </div>
        </div>
      </motion.header>

      <motion.div className={s.body} variants={BLOCK_MOTION}>
        <PageTabs items={tabs} label={t('tabs.label')} panelClassName={s.card} />
      </motion.div>

      <motion.div variants={BLOCK_MOTION}>
        <SupportCard />
      </motion.div>

      <div className={s.signOutBottom}>
        <AdminLink variant='block' />
        <SignOutButton variant='block' />
      </div>
    </motion.main>
  );
};
