'use client';

import { useTranslations } from 'next-intl';

import type { TopicChipsProps } from './TopicChips.types';

import s from './TopicChips.module.scss';

export const TopicChips = ({ topics, value, onChange }: TopicChipsProps) => {
  const t = useTranslations('faq.search');

  return (
    <div aria-label={t('topics')} className={s.root} role='group'>
      {topics.map(({ key, title }) => (
        <button key={key} aria-pressed={value === key} className={s.chip} type='button' onClick={() => onChange(value === key ? null : key)}>
          {title}
        </button>
      ))}
    </div>
  );
};
