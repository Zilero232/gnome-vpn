'use client';

import { clsx } from 'clsx';

import { Link } from '@/shared/i18n/navigation';

import type { UserLinkProps } from './UserLink.types';

import { adminUserPath } from '../../lib';
import { useAdminNavigation } from '../../model/context';
import { isPlainClick } from './UserLink.helpers';

import s from './UserLink.module.scss';

export const UserLink = ({ user, className }: UserLinkProps) => {
  const { openUser } = useAdminNavigation();

  return (
    <Link
      className={clsx(s.root, className)}
      href={adminUserPath(user.id)}
      onClick={(event) => {
        if (isPlainClick(event)) {
          event.preventDefault();
          openUser(user.id);
        }
      }}
    >
      {user.email}
    </Link>
  );
};
