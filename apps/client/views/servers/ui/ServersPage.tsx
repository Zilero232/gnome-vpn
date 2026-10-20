import { useTranslations } from 'next-intl';

import { PROTOCOL_IDS, PROTOCOL_ROWS, SERVER_LOCATIONS, SERVER_SECTIONS } from '@/entities/app/protocols';
import { blogPostRoute, ROUTES } from '@/shared/constants';
import { CountryFlag, Reveal, Text, TiltCard } from '@/ui-kit';
import { PageIntro } from '@/widgets/site/page-intro';
import { RelatedLinks } from '@/widgets/site/related-links';

import s from './ServersPage.module.scss';

export const ServersPage = () => {
  const t = useTranslations('servers');
  const tPlaces = useTranslations('landing.locations');

  return (
    <main className={s.root}>
      <PageIntro intro={t('intro')} title={t('title')} />

      <ul className={s.places}>
        {SERVER_LOCATIONS.map((location) => (
          <li key={location.code} className={s.place}>
            <CountryFlag className={s.flag} countryCode={location.code} size='lg' />
            <span className={s.country}>{tPlaces(`${location.key}Name`)}</span>
            <span className={s.city}>{tPlaces(`${location.key}City`)}</span>
          </li>
        ))}
      </ul>

      <section aria-labelledby='protocols-title' className={s.section}>
        <Text as='h2' className={s.heading} id='protocols-title'>
          {t('tableTitle')}
        </Text>

        <ul className={s.protocols}>
          {PROTOCOL_IDS.map((protocol) => (
            <TiltCard key={protocol} as='li' className={s.protocol}>
              <Text as='h3' className={s.protocolName}>
                {t(`protocols.${protocol}.name`)}
              </Text>
              <dl className={s.rows}>
                {PROTOCOL_ROWS.map((row) => (
                  <div key={row} className={s.row}>
                    <dt className={s.rowLabel}>{t(`rows.${row}`)}</dt>
                    <dd className={s.rowValue}>{t(`protocols.${protocol}.${row}`)}</dd>
                  </div>
                ))}
              </dl>
            </TiltCard>
          ))}
        </ul>
      </section>

      <Reveal className={s.notes} kind='group'>
        {SERVER_SECTIONS.map((section) => (
          <Reveal key={section} className={s.note} kind='item'>
            <Text as='h2' className={s.noteTitle}>
              {t(`sections.${section}.title`)}
            </Text>
            <Text as='p' className={s.body}>
              {t(`sections.${section}.body`)}
            </Text>
          </Reveal>
        ))}
      </Reveal>

      <RelatedLinks
        links={[
          { href: blogPostRoute('hysteria2-vs-vless'), label: t('related.comparison') },
          { href: blogPostRoute('vpn-not-working-hotel-wifi'), label: t('related.hotel') },
          { href: ROUTES.setup, label: t('related.setup') }
        ]}
      />
    </main>
  );
};
