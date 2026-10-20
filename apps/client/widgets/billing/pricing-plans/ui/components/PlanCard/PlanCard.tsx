import type { PlanId } from '@gnomevpn/schemas';

import { planDiscountPercent, planMonthlyRub } from '@gnomevpn/schemas';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';

import { AUTH_MODE, QUERY_PARAMS, ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { Badge, buttonVariants, Text, TiltCard } from '@/ui-kit';

import type { PlanCardProps } from './PlanCard.types';

import s from './PlanCard.module.scss';

const planHref = (plan: PlanId) => ({ pathname: ROUTES.account, query: { [QUERY_PARAMS.plan]: plan, [QUERY_PARAMS.mode]: AUTH_MODE.signup } });

export const PlanCard = ({ plan, isFeatured }: PlanCardProps) => {
  const t = useTranslations('plans');

  const discount = planDiscountPercent(plan.id);

  return (
    <TiltCard as='li' className={clsx(s.root, isFeatured && s.featured)}>
      <div className={s.head}>
        <Text as='span' className={s.term}>
          {t(`plans.${plan.id}`)}
        </Text>
        {isFeatured && <span className={s.best}>{t('best')}</span>}
      </div>

      <div className={s.price}>
        <Text as='span' className={s.amount}>
          {t('amount', { price: plan.priceRub })}
        </Text>
        {plan.months === 1 && (
          <Text as='span' className={s.period}>
            {t('period')}
          </Text>
        )}
      </div>

      <div className={s.monthly}>
        <Text as='span' size='sm' tone='muted'>
          {discount > 0 ? t('perMonth', { price: planMonthlyRub(plan.id) }) : t('noDiscount')}
        </Text>
        {discount > 0 && <Badge className={s.save}>{t('save', { percent: discount })}</Badge>}
      </div>

      <Link
        aria-label={t('chooseLabel', { plan: t(`plans.${plan.id}`) })}
        className={buttonVariants({ size: 'md', variant: isFeatured ? 'primary' : 'ghost', class: s.choose })}
        href={planHref(plan.id)}
      >
        {t('choose')}
      </Link>
    </TiltCard>
  );
};
