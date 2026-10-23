import { useFormatter, useTranslations } from 'next-intl';
import { isNonNullish } from 'remeda';

import { SELLER } from '@/shared/config';
import { ROUTES } from '@/shared/constants';
import { DATE_FORMAT } from '@/shared/i18n';
import { LegalDocument, LegalLink } from '@/widgets/site/legal-document';

import { TERMS_SECTIONS, TERMS_UPDATED } from '../config';
import { SellerDetails, TermsSection, TermsSummary } from './components';

export const TermsPage = () => {
  const t = useTranslations('terms');
  const format = useFormatter();

  const contents = TERMS_SECTIONS.map(({ key }, index) => ({ id: key, title: `${String(index + 1)}. ${t(`sections.${key}.title`)}` }));

  return (
    <LegalDocument
      contents={contents}
      footnote={t.rich('footnote', { privacy: (chunks) => <LegalLink href={ROUTES.privacy}>{chunks}</LegalLink> })}
      intro={t('intro')}
      summary={<TermsSummary />}
      title={t('title')}
      updated={t('updated', { date: format.dateTime(new Date(TERMS_UPDATED), DATE_FORMAT) })}
    >
      {TERMS_SECTIONS.map(({ key, clauses }, index) => (
        <TermsSection key={key} clauses={clauses} number={index + 1} section={key} />
      ))}

      {isNonNullish(SELLER.name) && <SellerDetails number={TERMS_SECTIONS.length + 1} />}
    </LegalDocument>
  );
};
