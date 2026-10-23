'use client';

import { Ticket } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FormField, Input } from '@/ui-kit';

import type { PromoCodeFieldProps } from './PromoCodeField.types';

import s from './PromoCodeField.module.scss';

export const PromoCodeField = ({ isOpen, registration, error, onOpen }: PromoCodeFieldProps) => {
  const t = useTranslations('auth');

  if (!isOpen) {
    return (
      <button className={s.toggle} type='button' onClick={onOpen}>
        <Ticket aria-hidden size={16} />
        {t('promo.toggle')}
      </button>
    );
  }

  return (
    <FormField error={error} hint={t('promo.hint')} htmlFor='signup-promo' label={t('fields.promoCode')}>
      <Input autoCapitalize='characters' autoComplete='off' className={s.input} id='signup-promo' spellCheck={false} {...registration} />
    </FormField>
  );
};
