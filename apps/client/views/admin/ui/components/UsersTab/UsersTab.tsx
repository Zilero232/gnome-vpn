'use client';

import { useTranslations } from 'next-intl';

import { PaymentRows } from '@/features/admin/manage-payments';
import { UserCard, UsersPanel } from '@/features/admin/manage-users';

import type { UsersTabProps } from './UsersTab.types';

export const UsersTab = ({ userId }: UsersTabProps) => {
  const t = useTranslations('admin.user');

  if (!userId) {
    return <UsersPanel />;
  }

  return (
    <UserCard
      key={userId}
      renderPayments={({ payments }) => <PaymentRows caption={t('payments')} payments={payments} withUser={false} />}
      userId={userId}
    />
  );
};
