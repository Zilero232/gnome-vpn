'use client';

import { CreditCard, Gift, LogOut, MonitorSmartphone, Plug, Send, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { useSubscriptionStatus } from '@/entities/billing/subscription';
import { useClaimPendingReferral } from '@/features/account/invite-friends';
import { useSignOut } from '@/features/auth/sign-out';
import { useVerifyEmailOutcome } from '@/features/auth/verify-email';
import { ACCOUNT_TAB } from '@/shared/constants';

import type { AccountTab } from './components';

import { BLOCK_MOTION, HEADER_MOTION, PAGE_MOTION } from './AccountPage.motion';
import { AccountIdentity, AccountTabs, ConnectCard, DevicesCard, InviteCard, ProfileCard, SubscriptionCard, TelegramCard } from './components';

import s from './AccountPage.module.scss';

export const AccountPage = () => {
  const t = useTranslations('account');
  const { subscription, isLoading, isError, refetch, hasAccess } = useSubscriptionStatus();

  const signOut = useSignOut();

  useVerifyEmailOutcome();
  useClaimPendingReferral();

  const tabs: AccountTab[] = [
    {
      value: 'subscription',
      label: t('tabs.subscription'),
      icon: CreditCard,
      render: () => <SubscriptionCard isError={isError} isLoading={isLoading} subscription={subscription} onRetry={() => void refetch()} />
    },
    {
      value: ACCOUNT_TAB.connect,
      label: t('tabs.connect'),
      icon: Plug,
      aliases: [ACCOUNT_TAB.wireguard],
      render: () => <ConnectCard hasWireguard={hasAccess} />
    },
    ...(hasAccess
      ? [
          {
            value: 'devices',
            label: t('tabs.devices'),
            icon: MonitorSmartphone,
            render: () => <DevicesCard />
          }
        ]
      : []),
    {
      value: 'invite',
      label: t('tabs.invite'),
      icon: Gift,
      render: () => <InviteCard />
    },
    {
      value: 'profile',
      label: t('profile.title'),
      icon: UserRound,
      render: () => <ProfileCard />
    },
    {
      value: 'telegram',
      label: t('tabs.telegram'),
      icon: Send,
      render: () => <TelegramCard />
    }
  ];

  return (
    <motion.main animate='visible' className={s.root} initial='hidden' variants={PAGE_MOTION}>
      <motion.header className={s.header} variants={HEADER_MOTION}>
        <AccountIdentity />

        <button aria-busy={signOut.isPending} className={s.signOut} disabled={signOut.isPending} type='button' onClick={() => signOut.mutate()}>
          <LogOut aria-hidden size={15} />
          <span className={s.signOutLabel}>{t('signOut')}</span>
        </button>
      </motion.header>

      <motion.div className={s.body} variants={BLOCK_MOTION}>
        <AccountTabs items={tabs} label={t('tabs.label')} panelClassName={s.card} />
      </motion.div>
    </motion.main>
  );
};
