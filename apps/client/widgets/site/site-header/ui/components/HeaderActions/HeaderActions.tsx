'use client';

import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { isIncludedIn } from 'remeda';

import { useCurrentUser } from '@/entities/auth/user';
import { AUTH_MODE, QUERY_PARAMS, ROUTES } from '@/shared/constants';
import { Link, usePathname } from '@/shared/i18n/navigation';
import { buttonVariants } from '@/ui-kit';

import type { HeaderActionsProps } from './HeaderActions.types';

import { ENTRANCE_ROUTES } from './HeaderActions.constants';

import s from './HeaderActions.module.scss';

export const HeaderActions = ({ isStacked = false, className, onNavigate }: HeaderActionsProps) => {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { isAuthenticated } = useCurrentUser();

  const size = isStacked ? 'lg' : 'md';

  if (isAuthenticated) {
    return (
      <div className={clsx(s.root, isStacked && s.stacked, className)}>
        <Link
          aria-current={pathname === ROUTES.account ? 'page' : undefined}
          className={buttonVariants({ size, variant: pathname === ROUTES.account ? 'ghost' : 'primary' })}
          href={ROUTES.account}
          onClick={onNavigate}
        >
          {t('account')}
        </Link>
      </div>
    );
  }

  if (isIncludedIn(pathname, ENTRANCE_ROUTES)) {
    return null;
  }

  return (
    <div className={clsx(s.root, isStacked && s.stacked, className)}>
      <Link className={buttonVariants({ size, variant: 'ghost' })} href={ROUTES.auth} onClick={onNavigate}>
        {t('signIn')}
      </Link>
      <Link
        className={buttonVariants({ size, class: clsx(!isStacked && s.tryFree) })}
        href={{ pathname: ROUTES.account, query: { [QUERY_PARAMS.mode]: AUTH_MODE.signup } }}
        onClick={onNavigate}
      >
        {t('tryFree')}
      </Link>
    </div>
  );
};
