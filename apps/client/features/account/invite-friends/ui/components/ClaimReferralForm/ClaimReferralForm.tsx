'use client';

import type { ClaimReferralInput } from '@gnomevpn/schemas';

import { claimReferralSchema, REFERRAL_POLICY } from '@gnomevpn/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBoolean, useDidUpdate } from '@siberiacancode/reactuse';
import { ChevronDown, Ticket } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useErrorMessage, useFieldError, useToastError } from '@/entities/app/locale';
import { FormField, Input, SubmitButton, Text } from '@/ui-kit';

import { isFinalRefusal } from '../../../lib';
import { useClaimReferral } from '../../../model/hooks';
import { DEFAULT_VALUES } from './ClaimReferralForm.constants';

import s from './ClaimReferralForm.module.scss';

export const ClaimReferralForm = () => {
  const t = useTranslations('referrals');
  const fieldError = useFieldError();
  const toastError = useToastError();
  const errorMessage = useErrorMessage();
  const panelId = useId();
  const inputId = useId();
  const { isPending, mutate } = useClaimReferral();

  const [isOpen, toggleOpen] = useBoolean(false);

  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    setError,
    setFocus
  } = useForm<ClaimReferralInput>({
    resolver: zodResolver(claimReferralSchema),
    defaultValues: DEFAULT_VALUES
  });

  useDidUpdate(() => {
    if (isOpen) {
      setFocus('code');
    }
  }, [isOpen]);

  const onSubmit = handleSubmit((values) => {
    mutate(values, {
      onSuccess: () => toast.success(t('claimed')),
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
