import { DEFAULT_DEVICE_LIMIT } from '@gnomevpn/schemas';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { Reveal, Text } from '@/ui-kit';
import { PricingCard } from '@/widgets/billing/pricing-plans';

import s from './HomePricing.module.scss';

export const HomePricing = () => {
  const t = useTranslations('landing.pricing');

  return (
    <section aria-labelledby='pricing-title' className={s.root} id='pricing'>
      <Reveal className={s.head}>
        <Text as='h2' className={s.title} id='pricing-title'>
          {t('title')}
        </Text>
        <Text as='p' className={s.intro}>
          {t('intro', { count: DEFAULT_DEVICE_LIMIT })}
        </Text>
      </Reveal>

      <PricingCard />

      <div className={s.notes}>
        <Text as='p' className={s.trial}>
          {t('trial')}
        </Text>
        <Text as='p' className={s.renew}>
          {t('renew')}
        </Text>
        <Link className={s.more} href={ROUTES.pricing}>
          {t('more')}
          <ArrowRight aria-hidden size={16} />
        </Link>
      </div>
    </section>
  );
};
