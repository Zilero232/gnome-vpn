'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useAdminNavigation } from '@/entities/admin/navigation';
import { QueryBlock } from '@/entities/admin/records';
import { Button } from '@/ui-kit';

import type { UserCardProps } from './UserCard.types';

import { useAdminUser } from '../model/hooks';
import {
  CardSection,
  DevicesSection,
  LinkSection,
  ProfileSection,
  PromoSection,
  ReferralSection,
  SubscriptionSection,
  UserHeader
} from './components';

import s from './UserCard.module.scss';

export const UserCard = ({ userId, renderPayments }: UserCardProps) => {
  const t = useTranslations('admin.user');
  const { closeUser } = useAdminNavigation();

  const { data: card, isPending, isRefetching, refetch } = useAdminUser(userId);

  return (
    <div className={s.root}>
      <Button className={s.back} size='md' variant='ghost' onClick={closeUser}>
        <ArrowLeft aria-hidden size={16} />
        {t('back')}
      </Button>

      <QueryBlock data={card} isPending={isPending} isRetrying={isRefetching} onRetry={() => void refetch()}>
        {({ profile, subscription, link, devices, payments, referral, redemptions, gifts }) => (
          <>
            <UserHeader access={subscription?.access ?? 'none'} profile={profile} />

            <div className={s.sections}>
              <ProfileSection profile={profile} />
              <SubscriptionSection subscription={subscription} userId={profile.id} />
              <LinkSection link={link} userId={profile.id} />
              <DevicesSection devices={devices} userId={profile.id} />

              <CardSection title={t('payments')}>{renderPayments({ userId: profile.id, payments })}</CardSection>

              <ReferralSection referral={referral} />
              <PromoSection gifts={gifts} redemptions={redemptions} />
            </div>
          </>
        )}
      </QueryBlock>
    </div>
  );
};
