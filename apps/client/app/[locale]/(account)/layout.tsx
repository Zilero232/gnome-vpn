import type { ReactNode } from 'react';

import { AccountShell } from '@/views/account';
import { CONTENT_ID, SiteHeader } from '@/widgets/site/site-header';

import s from './layout.module.scss';

const AccountLayout = ({ children }: { children: ReactNode }) => (
  <div className={s.root}>
    <SiteHeader />

    <div className={s.content} id={CONTENT_ID} tabIndex={-1}>
      <AccountShell>{children}</AccountShell>
    </div>
  </div>
);

export default AccountLayout;
