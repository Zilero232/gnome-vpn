'use client';

import { LayoutDashboard, Receipt, Server, TicketPercent, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';

import type { PageTab } from '@/ui-kit';

import { useAdminAccess } from '@/entities/admin/access';
import { AdminNavigationContext, useAdminNavigationState } from '@/entities/admin/navigation';
import { NodesPanel } from '@/features/admin/manage-nodes';
import { PaymentsPanel } from '@/features/admin/manage-payments';
import { PromoCodesPanel } from '@/features/admin/manage-promo-codes';
import { OverviewPanel } from '@/features/admin/overview';
import { ADMIN_TAB, ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { LoadingBlock, PageTabs, Text } from '@/ui-kit';

import { UsersTab } from './components';

import s from './AdminPage.module.scss';

export const AdminPage = () => {
  const t = useTranslations('admin');
  const access = useAdminAccess();
  const navigation = useAdminNavigationState();

  if (access.isDenied) {
    notFound();
  }

  if (access.isResolving) {
    return <LoadingBlock label={t('common.loading')} />;
  }

  const tabs: PageTab[] = [
    { value: ADMIN_TAB.overview, label: t('tabs.overview'), icon: LayoutDashboard, render: () => <OverviewPanel /> },
    { value: ADMIN_TAB.users, label: t('tabs.users'), icon: Users, render: () => <UsersTab userId={navigation.userId} /> },
    { value: ADMIN_TAB.payments, label: t('tabs.payments'), icon: Receipt, render: () => <PaymentsPanel /> },
    { value: ADMIN_TAB.promo, label: t('tabs.promo'), icon: TicketPercent, render: () => <PromoCodesPanel /> },
    { value: ADMIN_TAB.nodes, label: t('tabs.nodes'), icon: Server, render: () => <NodesPanel /> }
  ];

  return (
    <AdminNavigationContext value={navigation}>
      <main className={s.root}>
        <header className={s.header}>
          <div className={s.identity}>
            <Text as='h1' className={s.title}>
              {t('title')}
            </Text>

            <Text as='p' className={s.email}>
              {access.email}
            </Text>
          </div>

          <Link className={s.back} href={ROUTES.account}>
            {t('toAccount')}
          </Link>
        </header>

        <PageTabs items={tabs} label={t('tabs.label')} layout='bar' panelClassName={s.card} />
      </main>
    </AdminNavigationContext>
  );
};
