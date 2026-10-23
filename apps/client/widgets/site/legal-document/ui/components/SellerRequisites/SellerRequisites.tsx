import { useTranslations } from 'next-intl';

import { SELLER, SITE } from '@/shared/config';

import { sellerRows } from '../../../lib';

import s from './SellerRequisites.module.scss';

export const SellerRequisites = () => {
  const t = useTranslations('common.legal.seller');

  return (
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
  );
};
