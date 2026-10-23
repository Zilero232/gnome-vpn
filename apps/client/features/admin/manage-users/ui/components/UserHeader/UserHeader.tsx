'use client';

import { useTranslations } from 'next-intl';

import { AccessBadge, useAdminFormat } from '@/entities/admin/records';
import { SectionHead } from '@/ui-kit';

import type { UserHeaderProps } from './UserHeader.types';

export const UserHeader = ({ profile, access }: UserHeaderProps) => {
  const t = useTranslations('admin.user');
  const format = useAdminFormat();

  return (
    <SectionHead
      actions={<AccessBadge access={access} />}
      description={t('since', { date: format.date(profile.createdAt) })}
      title={profile.hasEmail ? profile.email : t('profile.noEmail')}
    />
  );
};
