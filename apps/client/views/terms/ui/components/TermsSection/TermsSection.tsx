import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import { ROUTES } from '@/shared/constants';
import { LegalLink, LegalSection } from '@/widgets/site/legal-document';

import type { TermsSectionProps } from './TermsSection.types';

import { TERMS_VALUES } from '../../../config';

import s from './TermsSection.module.scss';

const TAGS = {
  consent: (chunks: ReactNode) => <LegalLink href={ROUTES.consent}>{chunks}</LegalLink>,
  privacy: (chunks: ReactNode) => <LegalLink href={ROUTES.privacy}>{chunks}</LegalLink>,
  pricing: (chunks: ReactNode) => <LegalLink href={ROUTES.pricing}>{chunks}</LegalLink>
};

export const TermsSection = ({ section, clauses, number }: TermsSectionProps) => {
  const t = useTranslations(`terms.sections.${section}`);

  return (
    <LegalSection id={section} title={`${String(number)}. ${t('title')}`}>
      {Array.from({ length: clauses }, (_, index) => (
        <p key={`${section}-${String(index)}`}>
          <span className={s.number}>{`${String(number)}.${String(index + 1)}.`}</span>{' '}
          {t.rich(`clauses.${String(index)}`, { ...TERMS_VALUES, ...TAGS })}
        </p>
      ))}
    </LegalSection>
  );
};
