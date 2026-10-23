import { useTranslations } from 'next-intl';

import type { LegalContentsProps } from './LegalContents.types';

import s from './LegalContents.module.scss';

export const LegalContents = ({ items, variant }: LegalContentsProps) => {
  const t = useTranslations('common.legal');

  const nav = (
    <nav aria-label={t('contents')}>
      <ul className={s.list}>
        {items.map(({ id, title }) => (
          <li key={id}>
            <a className={s.link} href={`#${id}`}>
              {title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );

  if (variant === 'aside') {
    return (
      <div className={s.aside}>
        <p className={s.title}>{t('contents')}</p>
        {nav}
      </div>
    );
  }

  return (
    <details className={s.inline}>
      <summary className={s.summary}>{t('contents')}</summary>
      {nav}
    </details>
  );
};
