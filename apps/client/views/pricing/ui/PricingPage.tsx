import { Gift } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PaymentMethodsNote } from '@/entities/billing/payment-notes';
import { AUTH_MODE, blogPostRoute, QUERY_PARAMS, ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { Accordion, buttonVariants, GnomeBadge, Text } from '@/ui-kit';
import { PricingCard } from '@/widgets/billing/pricing-plans';
import { PageIntro } from '@/widgets/site/page-intro';
import { RelatedLinks } from '@/widgets/site/related-links';

import { PRICING_SECTIONS } from '../config';
import { IncludedSection, ReferralSection } from './components';

import s from './PricingPage.module.scss';

export const PricingPage = () => {
  const t = useTranslations('pricing');

  return (
    <main className={s.root}>
      <PageIntro intro={t('intro')} title={t('title')} />

      <div className={s.plans}>
        <PricingCard withFeatures={false} />

        <PaymentMethodsNote className={s.offer} />

        <Text as='p' className={s.offer}>
          {t.rich('offer', {
            terms: (chunks) => (
              <Link className={s.offerLink} href={ROUTES.terms}>
                {chunks}
              </Link>
            )
          })}
        </Text>
      </div>

      <aside className={s.trial}>
        <GnomeBadge className={s.trialBadge} size={56} />
        <Text as='p' className={s.trialText}>
          {t('trial')}
        </Text>
        <Link
          className={buttonVariants({ variant: 'ghost', class: s.trialCta })}
          href={{ pathname: ROUTES.account, query: { [QUERY_PARAMS.mode]: AUTH_MODE.signup } }}
        >
          {t('trialCta')}
        </Link>
      </aside>

      <aside className={s.gift}>
        <Gift aria-hidden className={s.giftIcon} size={40} />
        <Text as='p' className={s.trialText}>
          {t('gift')}
        </Text>
        <Link className={buttonVariants({ variant: 'ghost', class: s.trialCta })} href={ROUTES.account}>
          {t('giftCta')}
        </Link>
      </aside>

      <ReferralSection />

      <IncludedSection />

      <section aria-labelledby='sections-title' className={s.sections}>
        <Text as='h2' className={s.sectionsTitle} id='sections-title'>
          {t('sectionsTitle')}
        </Text>

        <Accordion
          items={PRICING_SECTIONS.map((section) => ({
            value: section,
            title: t(`sections.${section}.title`),
            content: t(`sections.${section}.body`)
          }))}
        />
      </section>

      <RelatedLinks
        links={[
          { href: ROUTES.faq, label: t('related.faq') },
          { href: ROUTES.servers, label: t('related.servers') },
          { href: blogPostRoute('subscription-link-explained'), label: t('related.subscription') }
        ]}
      />
    </main>
  );
};
