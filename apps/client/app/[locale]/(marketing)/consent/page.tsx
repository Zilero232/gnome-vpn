import { getTranslations } from 'next-intl/server';
import * as rootParams from 'next/root-params';

import { ROUTES } from '@/shared/constants';
import { resolveLocale } from '@/shared/i18n';
import { PageJsonLd } from '@/shared/seo';
import { translatedMetadata } from '@/shared/seo/translated-metadata';
import { ConsentPage } from '@/views/consent';

export const generateMetadata = () => translatedMetadata({ namespace: 'consent', path: ROUTES.consent, isIndexed: true });

const Page = async () => {
  const locale = resolveLocale(await rootParams.locale());
  const t = await getTranslations({ locale, namespace: 'consent' });

  return (
    <>
      <PageJsonLd locale={locale} name={t('meta.title')} path={ROUTES.consent} />

      <ConsentPage />
    </>
  );
};

export default Page;
