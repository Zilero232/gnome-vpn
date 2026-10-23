import { getTranslations } from 'next-intl/server';
import * as rootParams from 'next/root-params';

import { ROUTES } from '@/shared/constants';
import { resolveLocale } from '@/shared/i18n';
import { PageJsonLd } from '@/shared/seo';
import { translatedMetadata } from '@/shared/seo/translated-metadata';
import { AboutPage } from '@/views/about';

export const generateMetadata = () => translatedMetadata({ namespace: 'about', path: ROUTES.about, isIndexed: true });

const Page = async () => {
  const locale = resolveLocale(await rootParams.locale());
  const t = await getTranslations({ locale, namespace: 'about' });

  return (
    <>
      <PageJsonLd locale={locale} name={t('meta.title')} path={ROUTES.about} />

      <AboutPage />
    </>
  );
};

export default Page;
