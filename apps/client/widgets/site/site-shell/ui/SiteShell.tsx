import type { SiteShellProps } from './SiteShell.types';

import { SiteFooter } from '../../site-footer';
import { CONTENT_ID, SiteHeader } from '../../site-header';

import s from './SiteShell.module.scss';

export const SiteShell = ({ children }: SiteShellProps) => (
  <div className={s.root}>
    <SiteHeader />

    <div className={s.content} id={CONTENT_ID} tabIndex={-1}>
      {children}
    </div>

    <SiteFooter />
  </div>
);
