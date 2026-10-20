import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AUTH_MODE, blogPostRoute, QUERY_PARAMS, ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { Accordion, buttonVariants, GnomeBadge, Text } from '@/ui-kit';
import { PricingCard } from '@/widgets/billing/pricing-plans';
import { PageIntro } from '@/widgets/site/page-intro';
import { RelatedLinks } from '@/widgets/site/related-links';

import { PRICING_INCLUDED, PRICING_SECTIONS } from '../config';

import s from './PricingPage.module.scss';

export const PricingPage = () => {
  const t = useTranslations('pricing');

  return (
    <main className={s.root}>
      <PageIntro intro={t('intro')} title={t('title')} />

      <PricingCard withFeatures={false} />

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

      <section aria-labelledby='included-title' className={s.included}>
        <Text as='h2' className={s.sectionTitle} id='included-title'>
          {t('includedTitle')}
        </Text>

        <ul className={s.list}>
          {PRICING_INCLUDED.map((item) => (
            <li key={item} className={s.item}>
              <Check aria-hidden className={s.check} size={18} />
              <span>{t(`included.${item}`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby='sections-title'>
        <Text as='h2' className={s.sectionTitle} id='sections-title'>
          {t('sectionsTitle')}
        </Text>

        <Accordion
          items={PRICING_SECTIONS.map((section) => ({
            value: section,
            title: t(`sections.${section}.title`),
            content: t(`sections.${section}.body`)
          }))}
          className={s.accordion}
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
