import { PLANS } from '@gnomevpn/schemas';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { PricingCardProps } from './PricingCard.types';

import { FEATURED_PLAN_ID, PRICING_FEATURES } from '../config';
import { PlanCard } from './components';

import s from './PricingCard.module.scss';

export const PricingCard = ({ withFeatures = true }: PricingCardProps) => {
  const t = useTranslations('plans');

  return (
    <div className={s.root}>
      <ul className={s.plans}>
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} isFeatured={plan.id === FEATURED_PLAN_ID} plan={plan} />
        ))}
      </ul>

      {withFeatures && (
        <ul className={s.list}>
          {PRICING_FEATURES.map((feature) => (
            <li key={feature} className={s.item}>
              <Check aria-hidden className={s.check} />
              {t(feature)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
