import { getTranslations } from 'next-intl/server';
import * as rootParams from 'next/root-params';

import { resolveLocale } from '@/shared/i18n';
import { createPageMetadata } from '@/shared/seo';
import { NotFoundView } from '@/views/not-found';
import { SiteShell } from '@/widgets/site/site-shell';

export const generateMetadata = async () => {
  const locale = resolveLocale(await rootParams.locale());
  const t = await getTranslations({ locale, namespace: 'notFound' });

  return createPageMetadata({ title: t('code'), description: t('body'), locale });
};

const NotFound = () => (
  <SiteShell>
    <NotFoundView />
  </SiteShell>
);

export default NotFound;
