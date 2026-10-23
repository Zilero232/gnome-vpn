'use client';

import { discountedPriceRub } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';

import { Text } from '@/ui-kit';

import type { PlanPriceProps } from './PlanPrice.types';

import s from './PlanPrice.module.scss';

export const PlanPrice = ({ priceRub, discount }: PlanPriceProps) => {
  const t = useTranslations('account.plans');

  if (!discount) {
    return (
      <Text as='span' className={s.price}>
        {t('price', { price: priceRub })}
      </Text>
    );
  }

  return (
    <span className={s.root}>
      <s aria-hidden className={s.full}>
        {t('price', { price: priceRub })}
      </s>

      <span className={s.hidden}>{t('fullPrice', { price: priceRub })}</span>

      <Text as='span' className={s.price}>
        {t('price', { price: discountedPriceRub({ priceRub, percent: discount.percent }) })}
      </Text>
    </span>
  );
};
