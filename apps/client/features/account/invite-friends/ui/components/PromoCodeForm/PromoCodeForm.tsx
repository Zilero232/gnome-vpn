'use client';

import type { RedeemPromoCodeInput } from '@gnomevpn/schemas';

import { redeemPromoCodeSchema, REFERRAL_POLICY } from '@gnomevpn/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBoolean, useDidUpdate } from '@siberiacancode/reactuse';
import { ChevronDown, Ticket } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { useForm } from 'react-hook-form';

import { useErrorMessage, useFieldError, useToastError } from '@/entities/app/locale';
import { FormField, Input, SubmitButton, Text } from '@/ui-kit';

import { isFinalRefusal } from '../../../lib';
import { useRedeemedToast, useRedeemPromoCode } from '../../../model/hooks';
import { DEFAULT_VALUES } from './PromoCodeForm.constants';

import s from './PromoCodeForm.module.scss';

export const PromoCodeForm = () => {
  const t = useTranslations('referrals');
  const fieldError = useFieldError();
  const toastError = useToastError();
  const errorMessage = useErrorMessage();
  const redeemedToast = useRedeemedToast();
  const panelId = useId();
  const inputId = useId();
  const { isPending, mutate } = useRedeemPromoCode();

  const [isOpen, toggleOpen] = useBoolean(false);

  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
    setError,
    setFocus
  } = useForm<RedeemPromoCodeInput>({
    resolver: zodResolver(redeemPromoCodeSchema),
    defaultValues: DEFAULT_VALUES
  });

  useDidUpdate(() => {
    if (isOpen) {
      setFocus('code');
    }
  }, [isOpen]);

  const onSubmit = handleSubmit((values) => {
    mutate(values, {
      onSuccess: (result) => {
        reset(DEFAULT_VALUES, { keepFieldsRef: true });
        setFocus('code');
        redeemedToast(result);
      },
      onError: (error) => {
        if (!isFinalRefusal(error)) {
          toastError(error);

          return;
        }

        setError('code', { type: 'server', message: errorMessage(error) }, { shouldFocus: true });
      }
    });
  });

  const codeError = errors.code?.type === 'server' ? errors.code.message : fieldError(errors.code);

  return (
    <section className={s.root} data-open={isOpen}>
      <button aria-controls={panelId} aria-expanded={isOpen} className={s.toggle} type='button' onClick={() => toggleOpen()}>
        <Ticket aria-hidden className={s.toggleIcon} size={18} />
        <span className={s.toggleTitle}>{t('claimTitle')}</span>
        <ChevronDown aria-hidden className={s.chevron} size={18} />
      </button>

      <form noValidate className={s.form} hidden={!isOpen} id={panelId} onSubmit={onSubmit}>
        <Text as='p' size='xs' tone='muted'>
          {t('claimHint', { days: REFERRAL_POLICY.claimWindowDays })}
        </Text>

        <div className={s.row}>
          <FormField className={s.field} error={codeError} htmlFor={inputId} label={t('claimLabel')}>
            <Input autoCapitalize='characters' autoComplete='off' className={s.input} id={inputId} spellCheck={false} {...register('code')} />
          </FormField>

          <SubmitButton className={s.submit} disabled={!isDirty} isPending={isPending} size='md'>
            {t('claimSubmit')}
          </SubmitButton>
        </div>
      </form>
    </section>
  );
};
