import { getTranslations } from 'next-intl/server';
import * as rootParams from 'next/root-params';

import { ROUTES } from '@/shared/constants';
import { resolveLocale } from '@/shared/i18n';
import { PageJsonLd } from '@/shared/seo';
import { translatedMetadata } from '@/shared/seo/translated-metadata';
import { TermsPage } from '@/views/terms';

export const generateMetadata = () => translatedMetadata({ namespace: 'terms', path: ROUTES.terms, isIndexed: true });

const Page = async () => {
  const locale = resolveLocale(await rootParams.locale());
  const t = await getTranslations({ locale, namespace: 'terms' });

  return (
    <>
      <PageJsonLd locale={locale} name={t('meta.title')} path={ROUTES.terms} />

      <TermsPage />
    </>
  );
};

export default Page;
