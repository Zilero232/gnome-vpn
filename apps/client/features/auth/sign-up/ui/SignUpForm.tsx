'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useAuthFormError, useFieldError, usePasswordLabels } from '@/entities/app/locale';
import { FINE_POINTER_QUERY, ROUTES } from '@/shared/constants';
import { Link } from '@/shared/i18n/navigation';
import { FormField, Input, PasswordInput, SubmitButton, Text } from '@/ui-kit';

import type { SignUpFormValues } from '../lib';
import type { SignUpFormProps } from './SignUpForm.types';

import { signUpFormSchema } from '../lib';
import { usePromoCode, useSignUp } from '../model/hooks';
import { PromoCodeField, SignUpConsents, StrengthMeter } from './components';

import s from './SignUpForm.module.scss';

const DEFAULT_VALUES: SignUpFormValues = { email: '', password: '', promoCode: '', isConsentGiven: false, isMarketingConsentGiven: false };

export const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
  const t = useTranslations('auth');
  const fieldError = useFieldError();
  const passwordLabels = usePasswordLabels();
  const { isPending, mutate } = useSignUp();

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setFocus,
    setValue,
    control
  } = useForm<SignUpFormValues>({ resolver: zodResolver(signUpFormSchema), defaultValues: DEFAULT_VALUES });

  const password = useWatch({ control, name: 'password' });
  const promo = usePromoCode({ register, setValue, setFocus });
  const onAuthError = useAuthFormError({ onFieldError: ({ field, message }) => setError(field, { message }, { shouldFocus: true }) });

  useEffect(() => {
    if (window.matchMedia(FINE_POINTER_QUERY).matches) {
      setFocus('email');
    }
  }, [setFocus]);

  const onSubmit = handleSubmit((values) => mutate(values, { onSuccess, onError: onAuthError }));

  return (
    <form noValidate className={s.form} onSubmit={onSubmit}>
      <FormField error={fieldError(errors.email)} htmlFor='signup-email' label={t('fields.email')}>
        <Input autoComplete='email' id='signup-email' inputMode='email' type='email' {...register('email')} />
      </FormField>

      <FormField error={fieldError(errors.password)} htmlFor='signup-password' label={t('fields.password')}>
        <PasswordInput autoComplete='new-password' capsLockLabel={t('capsLock')} id='signup-password' {...passwordLabels} {...register('password')} />
      </FormField>
      <StrengthMeter password={password} />

      <PromoCodeField error={fieldError(errors.promoCode)} isOpen={promo.isOpen} registration={promo.registration} onOpen={promo.open} />

      <SignUpConsents control={control} error={fieldError(errors.isConsentGiven)} />

      <SubmitButton isPending={isPending} size='lg'>
        {t('signUpAction')}
      </SubmitButton>

      <Text as='p' className={s.consent}>
        {t.rich('consent', {
          terms: (chunks) => (
            <Link className={s.link} href={ROUTES.terms}>
              {chunks}
            </Link>
          ),
          privacy: (chunks) => (
            <Link className={s.link} href={ROUTES.privacy}>
              {chunks}
            </Link>
          )
        })}
      </Text>
    </form>
  );
};
