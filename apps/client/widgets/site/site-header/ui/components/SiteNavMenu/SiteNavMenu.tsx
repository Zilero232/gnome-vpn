'use client';

import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { LocaleSwitcher } from '@/features/app/switch-locale';
import { SITE } from '@/shared/config';
import { SITE_NAV } from '@/shared/constants';
import { Link, usePathname } from '@/shared/i18n/navigation';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/ui-kit';

import { HeaderActions } from '../HeaderActions';

import s from './SiteNavMenu.module.scss';

export const SiteNavMenu = () => {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger aria-label={t('openMenu')} className={s.trigger}>
        <Menu aria-hidden size={18} />
      </DialogTrigger>

      <DialogContent className={s.content}>
        <DialogTitle className={s.title}>{t('menu')}</DialogTitle>

        <nav aria-label={t('ariaLabel')} className={s.nav}>
          {SITE_NAV.map(({ key, href }) => (
            <Link key={key} aria-current={pathname === href ? 'page' : undefined} className={s.link} href={href} onClick={close}>
              {t(key)}
            </Link>
          ))}
        </nav>

        <HeaderActions isStacked onNavigate={close} />

        <div className={s.footer}>
          <LocaleSwitcher />
          <a className={s.email} href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
