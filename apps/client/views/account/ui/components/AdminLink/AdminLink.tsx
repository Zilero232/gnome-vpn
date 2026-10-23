'use client';

import { clsx } from 'clsx';
import { ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useAdminAccess } from '@/entities/admin/access';
import { ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { buttonVariants } from '@/ui-kit';

import type { AdminLinkProps } from './AdminLink.types';

import s from './AdminLink.module.scss';

export const AdminLink = ({ variant = 'pill' }: AdminLinkProps) => {
  const t = useTranslations('account');
  const { isAdmin } = useAdminAccess();

  if (!isAdmin) {
    return null;
  }

  return (
    <Link className={variant === 'block' ? clsx(buttonVariants({ variant: 'ghost', size: 'md' }), s.block) : s.pill} href={ROUTES.admin}>
      <ShieldCheck aria-hidden size={16} />
      {t('adminLink')}
    </Link>
  );
};
