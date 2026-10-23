import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import { ROUTES } from '@/shared/constants';
import { LegalLink, LegalSection } from '@/widgets/site/legal-document';

import type { ConsentSectionProps } from './ConsentSection.types';

import { CONSENT_VALUES } from '../../../config';

import s from './ConsentSection.module.scss';

const TAGS = {
  privacy: (chunks: ReactNode) => <LegalLink href={ROUTES.privacy}>{chunks}</LegalLink>,
  terms: (chunks: ReactNode) => <LegalLink href={ROUTES.terms}>{chunks}</LegalLink>
};

export const ConsentSection = ({ section, items, number, children }: ConsentSectionProps) => {
  const t = useTranslations(`consent.sections.${section}`);

  return (
    <LegalSection id={section} title={`${String(number)}. ${t('title')}`}>
      <p>{t.rich('body', { ...CONSENT_VALUES, ...TAGS })}</p>

      {items > 0 && (
        <ul className={s.list}>
          {Array.from({ length: items }, (_, index) => (
            <li key={`${section}-${String(index)}`}>{t(`items.${String(index)}`)}</li>
          ))}
        </ul>
      )}

      {children}
    </LegalSection>
  );
};
