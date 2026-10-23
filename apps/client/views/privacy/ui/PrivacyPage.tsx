import { useFormatter, useTranslations } from 'next-intl';

import { ROUTES } from '@/shared/constants';
import { DATE_FORMAT } from '@/shared/i18n';
import { LegalDocument, LegalLink, LegalSection } from '@/widgets/site/legal-document';

import { PRIVACY_SECTIONS, PRIVACY_UPDATED } from '../config';

export const PrivacyPage = () => {
  const t = useTranslations('privacy');
  const format = useFormatter();

  const contents = PRIVACY_SECTIONS.map((section) => ({ id: section, title: t(`${section}.title`) }));

  return (
    <LegalDocument
      footnote={t.rich('terms', {
        terms: (chunks) => <LegalLink href={ROUTES.terms}>{chunks}</LegalLink>,
        consent: (chunks) => <LegalLink href={ROUTES.consent}>{chunks}</LegalLink>
      })}
      contents={contents}
      intro={t('intro')}
      title={t('title')}
      updated={t('updated', { date: format.dateTime(new Date(PRIVACY_UPDATED), DATE_FORMAT) })}
    >
      {PRIVACY_SECTIONS.map((section) => (
        <LegalSection key={section} id={section} title={t(`${section}.title`)}>
          <p>{t(`${section}.body`)}</p>
        </LegalSection>
      ))}
    </LegalDocument>
  );
};
