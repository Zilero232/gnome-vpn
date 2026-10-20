import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AUTH_MODE, blogPostRoute, QUERY_PARAMS, ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { Text } from '@/ui-kit';
import { PricingCard } from '@/widgets/billing/pricing-plans';
import { RelatedLinks } from '@/widgets/site/related-links';

import { PRICING_INCLUDED, PRICING_SECTIONS } from '../config';

import s from './PricingPage.module.scss';

export const PricingPage = () => {
  const t = useTranslations('pricing');

  return (
    <main className={s.root}>
      <header className={s.head}>
        <Text as='h1' className={s.title}>
          {t('title')}
        </Text>

        <Text as='p' className={s.intro} tone='muted'>
          {t('intro')}
        </Text>
      </header>

      <PricingCard />

      <Text align='center' as='p' className={s.trial} tone='muted'>
        {t('trial')}{' '}
        <Link className={s.trialLink} href={{ pathname: ROUTES.account, query: { [QUERY_PARAMS.mode]: AUTH_MODE.signup } }}>
          {t('trialCta')}
        </Link>
      </Text>

      <section>
        <Text as='h2' className={s.sectionTitle}>
          {t('includedTitle')}
        </Text>

        <ul className={s.list}>
          {PRICING_INCLUDED.map((item) => (
            <li key={item} className={s.item}>
              <Check aria-hidden className={s.check} size={16} />
              <span>{t(`included.${item}`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={s.sections}>
        <Text as='h2' className={s.sectionTitle}>
          {t('sectionsTitle')}
        </Text>

        {PRICING_SECTIONS.map((section) => (
          <div key={section} className={s.section}>
            <Text as='h3' className={s.sectionHeading}>
              {t(`sections.${section}.title`)}
            </Text>

            <Text as='p' className={s.sectionBody}>
              {t(`sections.${section}.body`)}
            </Text>
          </div>
        ))}
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
