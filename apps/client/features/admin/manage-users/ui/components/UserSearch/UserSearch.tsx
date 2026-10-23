'use client';

import { ADMIN_USER } from '@gnomevpn/schemas';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { FormField, Input, Spinner } from '@/ui-kit';

import type { UserSearchProps } from './UserSearch.types';

import s from './UserSearch.module.scss';

export const UserSearch = ({ value, isSearching, onChange }: UserSearchProps) => {
  const t = useTranslations('admin.users.search');
  const id = useId();

  return (
    <FormField hint={t('hint')} htmlFor={id} label={t('label')}>
      <div className={s.control} role='search'>
        {isSearching ? <Spinner className={s.icon} /> : <Search aria-hidden className={s.icon} size={18} />}

        <Input
          autoComplete='off'
          className={s.input}
          enterKeyHint='search'
          id={id}
          inputMode='search'
          maxLength={ADMIN_USER.searchMaxLength}
          placeholder={t('placeholder')}
          spellCheck={false}
          type='search'
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </FormField>
  );
};
