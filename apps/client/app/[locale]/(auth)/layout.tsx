import type { ReactNode } from 'react';

import { CONTENT_ID, SiteHeader } from '@/widgets/site/site-header';

import s from './layout.module.scss';

const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className={s.root}>
    <SiteHeader />

    <main className={s.main} id={CONTENT_ID} tabIndex={-1}>
      {children}
    </main>
  </div>
);

export default AuthLayout;
