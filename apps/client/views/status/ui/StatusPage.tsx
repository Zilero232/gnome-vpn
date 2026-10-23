import { useTranslations } from 'next-intl';

import { ConnectionCheck } from '@/features/vpn/check-connection';
import { blogPostRoute, ROUTES } from '@/shared/constants';
import { Text } from '@/ui-kit';
import { PageIntro } from '@/widgets/site/page-intro';
import { RelatedLinks } from '@/widgets/site/related-links';

import { NodeList } from './components';

import s from './StatusPage.module.scss';

export const StatusPage = () => {
  const t = useTranslations('status');

  return (
    <main className={s.root}>
      <PageIntro intro={t('intro')} title={t('title')} />

      <section aria-labelledby='nodes-title' className={s.section}>
        <Text as='h2' className={s.heading} id='nodes-title'>
          {t('nodes.title')}
        </Text>

        <NodeList />

        <Text as='p' className={s.note}>
          {t('nodes.note')}
        </Text>
      </section>

      <ConnectionCheck />

      <RelatedLinks
        links={[
          { href: ROUTES.servers, label: t('related.servers') },
          { href: ROUTES.setup, label: t('related.setup') },
          { href: blogPostRoute('vpn-not-working-hotel-wifi'), label: t('related.hotel') }
        ]}
      />
    </main>
  );
};
