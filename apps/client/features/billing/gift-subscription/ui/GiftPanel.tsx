'use client';

import type { PlanId } from '@gnomevpn/schemas';

import { DEFAULT_PLAN_ID, findPlan, PLANS } from '@gnomevpn/schemas';
import { Gift } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Segmented, SubmitButton, Text } from '@/ui-kit';

import { useBuyGift } from '../model/hooks';
import { GiftList } from './components';

import s from './GiftPanel.module.scss';

export const GiftPanel = () => {
  const t = useTranslations('gifts');
  const buy = useBuyGift();

  const [planId, setPlanId] = useState<PlanId>(DEFAULT_PLAN_ID);

  const options = PLANS.map((plan) => ({ value: plan.id, label: t(`planShort.${plan.id}`) }));

  return (
    <section className={s.root}>
      <header className={s.head}>
        <span aria-hidden className={s.icon}>
          <Gift size={15} />
        </span>

        <div className={s.headText}>
          <h3 className={s.title}>{t('title')}</h3>

          <Text as='p' size='xs' tone='muted'>
            {t('hint')}
          </Text>
        </div>
      </header>

      <div className={s.actions}>
        <Segmented aria-label={t('planLabel')} className={s.plans} options={options} value={planId} onChange={setPlanId} />

        <SubmitButton className={s.pay} isPending={buy.isPending} size='md' type='button' onClick={() => buy.mutate(planId)}>
          {t('pay', { price: findPlan(planId).priceRub })}
        </SubmitButton>
      </div>

      <GiftList />
    </section>
  );
};
