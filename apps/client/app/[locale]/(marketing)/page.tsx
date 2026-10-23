import { getTranslations } from 'next-intl/server';
import * as rootParams from 'next/root-params';

import { ROUTES } from '@/shared/constants';
import { resolveLocale } from '@/shared/i18n';
import { JsonLd, serviceJsonLd } from '@/shared/seo';
import { translatedMetadata } from '@/shared/seo/translated-metadata';
import { LandingPage } from '@/views/landing';

export const generateMetadata = () => translatedMetadata({ namespace: 'landing', path: ROUTES.landing, isIndexed: true });

const Page = async () => {
  const locale = resolveLocale(await rootParams.locale());
  const t = await getTranslations({ locale, namespace: 'landing' });

  const countries = [t('locations.netherlandsName'), t('locations.finlandName')];

  return (
    <>
      <JsonLd data={serviceJsonLd({ name: t('meta.title'), description: t('meta.description'), countries })} />

      <LandingPage />
    </>
  );
};

export default Page;
