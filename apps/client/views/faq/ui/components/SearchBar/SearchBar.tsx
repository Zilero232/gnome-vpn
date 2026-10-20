'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import type { SearchBarProps } from './SearchBar.types';

import s from './SearchBar.module.scss';

export const SearchBar = ({ value, inputRef, onChange }: SearchBarProps) => {
  const t = useTranslations('faq.search');
  const id = useId();

  return (
    <div className={s.root}>
      <label className={s.label} htmlFor={id}>
        {t('label')}
      </label>
      <Search aria-hidden className={s.icon} size={20} />
      <input
        ref={inputRef}
        aria-describedby={`${id}-hint`}
        autoComplete='off'
        className={s.input}
        enterKeyHint='search'
        id={id}
        placeholder={t('placeholder')}
        type='search'
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.key === 'Escape' && onChange('')}
      />
      {value !== '' && (
        <button aria-label={t('clear')} className={s.clear} type='button' onClick={() => onChange('')}>
          <X aria-hidden size={18} />
        </button>
      )}
      <span className={s.hint} id={`${id}-hint`}>
        {t('shortcut')}
      </span>
    </div>
  );
};
