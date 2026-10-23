'use client';

import type { PlanId } from '@gnomevpn/schemas';

import { DEFAULT_PLAN_ID, discountedPriceRub, findPlan, planDiscountPercent, planMonthlyRub, PLANS } from '@gnomevpn/schemas';
import { useMount } from '@siberiacancode/reactuse';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useSubscriptionStatus } from '@/entities/billing/subscription';
import { Badge, SelectableCard, Stack, Text } from '@/ui-kit';

import type { PlanPickerProps } from './PlanPicker.types';

import { planFromSearch } from '../lib';
import { usePendingDiscount } from '../model/hooks';
import { CheckoutButton, DiscountNote, PlanPrice } from './components';

import s from './PlanPicker.module.scss';

export const PlanPicker = ({ className, defaultPlan = DEFAULT_PLAN_ID, intent = 'buy' }: PlanPickerProps) => {
  const t = useTranslations('account.plans');
  const { subscription } = useSubscriptionStatus();
  const promo = usePendingDiscount();

  const [selected, setSelected] = useState<PlanId>(defaultPlan);

  useMount(() => {
    const fromUrl = planFromSearch(window.location.search);

    if (fromUrl) {
      setSelected(fromUrl);
    }
  });

  const plan = findPlan(selected);
  const isRenewalDisclosed = subscription?.isRecurringAvailable === true && !(subscription.period === 'paid' && subscription.cancelAtPeriodEnd);
  const price = promo ? discountedPriceRub({ priceRub: plan.priceRub, percent: promo.percent }) : plan.priceRub;

  return (
    <Stack className={clsx(s.root, className)} gap='md'>
      <Stack className={s.list} gap='sm'>
        {PLANS.map((option) => {
          const discount = planDiscountPercent(option.id);

          return (
            <SelectableCard key={option.id} className={s.card} isSelected={option.id === selected} onClick={() => setSelected(option.id)}>
              <Stack className={s.body} gap='sm'>
                <span className={s.head}>
                  <Text as='span' className={s.term}>
                    {t(option.id)}
                  </Text>
                  {discount > 0 && <Badge>{t('save', { percent: discount })}</Badge>}
                </span>

                <Text size='xs' tone='muted'>
                  {t('perMonth', { price: planMonthlyRub(option.id) })}
                </Text>
              </Stack>

              <PlanPrice discount={promo} priceRub={option.priceRub} />
            </SelectableCard>
          );
        })}
      </Stack>

      {promo && <DiscountNote discount={promo} />}

      <CheckoutButton className={s.submit} planId={selected}>
        {intent === 'extend' ? t('extend', { price }) : t('pay', { price })}
      </CheckoutButton>

      {isRenewalDisclosed && (
        <Text align='center' size='xs' tone='muted'>
          {t('renewalNote', { price: plan.priceRub, plan: plan.id })}
        </Text>
      )}
    </Stack>
  );
};
