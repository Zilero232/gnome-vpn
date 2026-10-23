import { useFormatter, useTranslations } from 'next-intl';

import { ROUTES } from '@/shared/constants';
import { DATE_FORMAT } from '@/shared/i18n';
import { LegalDocument, LegalLink, SellerRequisites } from '@/widgets/site/legal-document';

import { CONSENT_SECTIONS, CONSENT_UPDATED } from '../config';
import { ConsentSection } from './components';

export const ConsentPage = () => {
  const t = useTranslations('consent');
  const format = useFormatter();

  const contents = CONSENT_SECTIONS.map(({ key }, index) => ({ id: key, title: `${String(index + 1)}. ${t(`sections.${key}.title`)}` }));

  return (
    <LegalDocument
      footnote={t.rich('footnote', {
        privacy: (chunks) => <LegalLink href={ROUTES.privacy}>{chunks}</LegalLink>,
        terms: (chunks) => <LegalLink href={ROUTES.terms}>{chunks}</LegalLink>
      })}
      contents={contents}
      intro={t('intro')}
      title={t('title')}
      updated={t('updated', { date: format.dateTime(new Date(CONSENT_UPDATED), DATE_FORMAT) })}
    >
      {CONSENT_SECTIONS.map(({ key, items }, index) => (
        <ConsentSection key={key} items={items} number={index + 1} section={key}>
          {key === 'operator' && <SellerRequisites />}
        </ConsentSection>
      ))}
    </LegalDocument>
  );
};
