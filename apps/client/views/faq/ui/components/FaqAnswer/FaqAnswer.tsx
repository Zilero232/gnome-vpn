import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { isIncludedIn } from 'remeda';

import { FAQ_LINKS, FAQ_QUESTIONS } from '@/entities/app/faq';
import { Link } from '@/shared/i18n/navigation';

import type { FaqAnswerProps } from './FaqAnswer.types';

import s from './FaqAnswer.module.scss';

export const FaqAnswer = ({ value, children }: FaqAnswerProps) => {
  const t = useTranslations('faq.links');

  const href = isIncludedIn(value, FAQ_QUESTIONS) ? FAQ_LINKS[value] : undefined;

  if (!href) {
    return children;
  }

  return (
    <>
      {children}

      <Link className={s.link} href={href}>
        {t(value)}
        <ArrowRight aria-hidden size={16} />
      </Link>
    </>
  );
};
