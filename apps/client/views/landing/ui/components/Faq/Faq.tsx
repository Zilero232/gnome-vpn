import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FAQ_ANSWER_VALUES, FAQ_HIGHLIGHTS } from '@/entities/app/faq';
import { ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { Accordion, Text } from '@/ui-kit';

import s from './Faq.module.scss';

export const Faq = () => {
  const t = useTranslations('faq');
  const tLanding = useTranslations('landing.faq');

  return (
    <section aria-labelledby='faq-title' className={s.root} id='faq'>
      <header className={s.head}>
        <Text as='h2' className={s.title} id='faq-title'>
          {tLanding('title')}
        </Text>

        <Link className={s.more} href={ROUTES.faq}>
          {tLanding('more')}
          <ArrowRight aria-hidden size={16} />
        </Link>
      </header>

      <Accordion
        items={FAQ_HIGHLIGHTS.map((question) => ({
          value: question,
          title: t(`questions.${question}.q`),
          content: t(`questions.${question}.a`, FAQ_ANSWER_VALUES)
        }))}
      />
    </section>
  );
};
