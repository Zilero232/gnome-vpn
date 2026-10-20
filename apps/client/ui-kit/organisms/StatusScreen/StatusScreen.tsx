import { clsx } from 'clsx';

import type { StatusScreenProps } from './StatusScreen.types';

import { GnomeBadge } from '../../atoms/GnomeBadge';

import s from './StatusScreen.module.scss';

export const StatusScreen = ({ code, title, body, children, tone = 'accent', isInline = false }: StatusScreenProps) => (
  <main className={clsx(s.root, isInline && s.inline)}>
    <div className={s.mark}>
      <GnomeBadge className={s.badge} size={96} />
      <span className={clsx(s.code, tone === 'danger' ? s.codeDanger : s.codeAccent)}>{code}</span>
    </div>

    <h1 className={s.title}>{title}</h1>
    <p className={s.body}>{body}</p>

    {children && <div className={s.actions}>{children}</div>}
  </main>
);
