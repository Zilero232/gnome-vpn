import { useTranslations } from 'next-intl';

import { FAQ_ANSWER_VALUES, FAQ_GROUPS } from '@/entities/app/faq';
import { faqJsonLd, JsonLd } from '@/shared/seo';
import { PageIntro } from '@/widgets/site/page-intro';

import { FaqBrowser } from './components';

import s from './FaqPage.module.scss';

export const FaqPage = () => {
  const t = useTranslations('faq');

  const groups = FAQ_GROUPS.map(({ key, questions }) => ({
    key,
    title: t(`groups.${key}`),
    items: questions.map((question) => ({
      value: question,
      question: t(`questions.${question}.q`),
      answer: t(`questions.${question}.a`, FAQ_ANSWER_VALUES)
    }))
  }));

  const entries = groups.flatMap(({ items }) => items.map(({ question, answer }) => ({ question, answer })));

  return (
    <main className={s.root}>
      <JsonLd data={faqJsonLd({ entries })} />

      <PageIntro intro={t('intro')} title={t('title')} />

      <FaqBrowser groups={groups} />
    </main>
  );
};
