import { NextIntlClientProvider } from 'next-intl';
import * as rootParams from 'next/root-params';
import { Suspense } from 'react';

import { ROUTES } from '@/shared/constants';
import { resolveLocale, routeMessages, TIME_ZONE } from '@/shared/i18n';
import { translatedMetadata } from '@/shared/seo/translated-metadata';
import { AdminPage } from '@/views/admin';

export const generateMetadata = () => translatedMetadata({ namespace: 'admin', path: ROUTES.admin });

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
