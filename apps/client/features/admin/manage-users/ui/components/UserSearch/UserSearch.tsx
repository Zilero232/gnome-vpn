'use client';

import type { AdminUserSearch } from '@gnomevpn/schemas';

import { adminUserSearchSchema } from '@gnomevpn/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { useForm } from 'react-hook-form';

import { FormField, Input, SubmitButton } from '@/ui-kit';

import type { UserSearchProps } from './UserSearch.types';

import s from './UserSearch.module.scss';

const DEFAULT_VALUES: AdminUserSearch = { query: '' };

export const UserSearch = ({ isSearching, onSearch }: UserSearchProps) => {
  const t = useTranslations('admin.users.search');
  const id = useId();

  const { handleSubmit, register } = useForm<AdminUserSearch>({ resolver: zodResolver(adminUserSearchSchema), defaultValues: DEFAULT_VALUES });

  const onSubmit = handleSubmit(({ query }) => onSearch(query ?? ''));

  return (
    <form noValidate className={s.root} role='search' onSubmit={onSubmit}>
      <FormField className={s.field} hint={t('hint')} htmlFor={id} label={t('label')}>
        <Input autoComplete='off' id={id} inputMode='search' placeholder={t('placeholder')} spellCheck={false} type='search' {...register('query')} />
      </FormField>

      <SubmitButton className={s.submit} isPending={isSearching} size='md'>
        <Search aria-hidden size={16} />
        {t('submit')}
      </SubmitButton>
    </form>
  );
};
