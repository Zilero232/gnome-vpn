'use client';

import { useIntersectionObserver } from '@siberiacancode/reactuse';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';

import { ROUTES, SITE_NAV } from '@/shared/constants';
import { Link, usePathname } from '@/shared/i18n/navigation';
import { BrandMark } from '@/ui-kit';

import { HeaderActions, SiteNavMenu } from './components';
import { CONTENT_ID } from './SiteHeader.constants';

import s from './SiteHeader.module.scss';

export const SiteHeader = () => {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const pathname = usePathname();

  const { ref: sentinelRef, entries } = useIntersectionObserver<HTMLDivElement>();

  const isScrolled = entries?.at(-1)?.isIntersecting === false;

  return (
    <>
      <a className={s.skip} href={`#${CONTENT_ID}`}>
        {tCommon('skipToContent')}
      </a>

      <div aria-hidden ref={sentinelRef} className={s.sentinel} />

      <header className={clsx(s.root, isScrolled && s.scrolled)}>
        <div className={s.inner}>
          <Link aria-label={t('home')} className={s.brand} href={ROUTES.landing}>
            <BrandMark labelClassName={s.brandLabel} size='lg' />
          </Link>

          <nav aria-label={t('ariaLabel')} className={s.nav}>
            {SITE_NAV.map(({ key, href }) => (
              <Link key={key} aria-current={pathname === href ? 'page' : undefined} className={s.navLink} href={href}>
                {t(key)}
              </Link>
            ))}
          </nav>

          <div className={s.actions}>
            <HeaderActions />

            <SiteNavMenu />
          </div>
        </div>
      </header>
    </>
  );
};
