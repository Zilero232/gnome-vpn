import { useTranslations } from 'next-intl';

import { SELLER, SITE } from '@/shared/config';
import { LegalSection } from '@/widgets/site/legal-document';

import type { SellerDetailsProps } from './SellerDetails.types';

import { sellerRows } from '../../../lib';

import s from './SellerDetails.module.scss';

export const SellerDetails = ({ number }: SellerDetailsProps) => {
  const t = useTranslations('terms.seller');

  return (
    <LegalSection id='seller' title={`${String(number)}. ${t('title')}`}>
      <dl className={s.list}>
        {sellerRows(SELLER).map(({ field, value }) => (
          <div key={field} className={s.row}>
            <dt className={s.term}>{t(`fields.${field}`)}</dt>
            <dd className={s.value}>{field === 'status' ? t(`statuses.${value}`) : value}</dd>
          </div>
        ))}

        <div className={s.row}>
          <dt className={s.term}>{t('fields.email')}</dt>
          <dd className={s.value}>{SITE.email}</dd>
        </div>
      </dl>
    </LegalSection>
  );
};
