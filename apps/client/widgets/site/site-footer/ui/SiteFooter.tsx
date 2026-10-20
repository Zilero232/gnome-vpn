import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';

import { LocaleSwitcher } from '@/features/app/switch-locale';
import { SITE } from '@/shared/config';
import { FOOTER_GROUPS } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { GnomeBadge } from '@/ui-kit';

import { FooterCopy, FooterTelegram } from './components';

import s from './SiteFooter.module.scss';

export const SiteFooter = () => {
  const t = useTranslations('footer');

  return (
    <footer className={s.root}>
      <div className={s.inner}>
        <div className={s.brand}>
          <GnomeBadge className={s.mark} size={48} />
          <div className={s.brandText}>
            <span className={s.name}>{SITE.name}</span>
            <p className={s.note}>{t('note')}</p>
          </div>
        </div>

        <nav aria-label={t('ariaLabel')} className={s.nav}>
          {FOOTER_GROUPS.map(({ key, links }) => (
            <div key={key} className={s.group}>
              <span className={s.groupTitle}>{t(`groups.${key}`)}</span>
              {links.map((link) => (
                <Link key={link.key} className={s.link} href={link.href}>
                  {t(link.key)}
                </Link>
              ))}
            </div>
          ))}

          <div className={clsx(s.group, s.contacts)}>
            <span className={s.groupTitle}>{t('contacts')}</span>
            <a className={clsx(s.link, s.email)} href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
            <FooterTelegram className={s.link} />
          </div>
        </nav>

        <div className={s.meta}>
          <FooterCopy className={s.copy} />
          <LocaleSwitcher />
        </div>
      </div>
    </footer>
  );
};
