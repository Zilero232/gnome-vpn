import { getTranslations } from 'next-intl/server';
import * as rootParams from 'next/root-params';

import { ROUTES } from '@/shared/constants';
import { resolveLocale } from '@/shared/i18n';
import { PageJsonLd, ProductJsonLd } from '@/shared/seo';
import { translatedMetadata } from '@/shared/seo/translated-metadata';
import { PricingPage } from '@/views/pricing';

export const generateMetadata = () => translatedMetadata({ namespace: 'pricing', path: ROUTES.pricing, isIndexed: true });

const Page = async () => {
  const locale = resolveLocale(await rootParams.locale());
  const t = await getTranslations({ locale, namespace: 'pricing' });

  return (
    <>
      <ProductJsonLd />

      <PageJsonLd locale={locale} name={t('meta.title')} path={ROUTES.pricing} />

      <PricingPage />
    </>
  );
};

export default Page;
