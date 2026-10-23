import { useTranslations } from 'next-intl';

import { LegalSection, SellerRequisites } from '@/widgets/site/legal-document';

import type { SellerDetailsProps } from './SellerDetails.types';

export const SellerDetails = ({ number }: SellerDetailsProps) => {
  const t = useTranslations('terms.seller');

  return (
    <LegalSection id='seller' title={`${String(number)}. ${t('title')}`}>
      <SellerRequisites />
    </LegalSection>
  );
};
