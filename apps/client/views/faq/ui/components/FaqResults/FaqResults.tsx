import { useTranslations } from 'next-intl';

import { Accordion, Button } from '@/ui-kit';

import type { FaqResultsProps } from './FaqResults.types';

import { Highlighted } from '../Highlighted';

import s from './FaqResults.module.scss';

export const FaqResults = ({ hits, terms, visible, open, onOpenChange, onShowMore }: FaqResultsProps) => {
  const t = useTranslations('faq.search');

  const rest = hits.length - visible;

  return (
    <section aria-label={t('results')} className={s.root}>
      <Accordion
        items={hits.slice(0, visible).map(({ value, question, answer }) => ({
          value,
          title: <Highlighted terms={terms} text={question} />,
          content: <Highlighted terms={terms} text={answer} />
        }))}
        value={open}
        onValueChange={onOpenChange}
      />

      {rest > 0 && (
        <Button className={s.more} variant='ghost' onClick={onShowMore}>
          {t('showMore', { count: rest })}
        </Button>
      )}
    </section>
  );
};
