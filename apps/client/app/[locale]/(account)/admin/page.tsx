import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import * as rootParams from 'next/root-params';
import { Suspense } from 'react';

import { ROUTES } from '@/shared/constants';
import { resolveLocale, routeMessages, TIME_ZONE } from '@/shared/i18n';
import { createPageMetadata } from '@/shared/seo';
import { AdminPage } from '@/views/admin';

export const generateMetadata = async () => {
  const locale = resolveLocale(await rootParams.locale());
  const t = await getTranslations({ locale, namespace: 'admin' });

  return createPageMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    path: ROUTES.admin,
    locale
  });
};

const Page = async () => {
  const locale = resolveLocale(await rootParams.locale());

  return (
    <NextIntlClientProvider locale={locale} messages={routeMessages({ locale, namespaces: ['admin'] })} timeZone={TIME_ZONE}>
      <Suspense>
        <AdminPage />
      </Suspense>
    </NextIntlClientProvider>
  );
};

export default Page;
