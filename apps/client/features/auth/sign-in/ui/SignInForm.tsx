'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useAuthFormError, useFieldError, usePasswordLabels } from '@/entities/app/locale';
import { FormField, Input, PasswordInput, SubmitButton } from '@/ui-kit';

import type { SignInValues } from '../model/hooks';
import type { SignInFormProps } from './SignInForm.types';

import { signInSchema, useSignIn } from '../model/hooks';

import s from './SignInForm.module.scss';

const DEFAULT_VALUES: SignInValues = { email: '', password: '' };

export const SignInForm = ({ onForgotPassword, onSuccess }: SignInFormProps) => {
  const t = useTranslations('auth');
  const fieldError = useFieldError();
  const passwordLabels = usePasswordLabels();
  const { isPending, mutate } = useSignIn();

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setFocus
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: DEFAULT_VALUES
  });

  const onAuthError = useAuthFormError({ onFieldError: ({ field, message }) => setError(field, { message }, { shouldFocus: true }) });

  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) {
      setFocus('email');
    }
  }, [setFocus]);

  const onSubmit = handleSubmit((values) => {
    mutate(values, { onSuccess, onError: onAuthError });
  });

  return (
    <form noValidate className={s.form} onSubmit={onSubmit}>
      <FormField error={fieldError(errors.email)} htmlFor='signin-email' label={t('fields.email')}>
        <Input autoComplete='email' id='signin-email' inputMode='email' type='email' {...register('email')} />
      </FormField>

      <FormField error={fieldError(errors.password)} htmlFor='signin-password' label={t('fields.password')}>
        <PasswordInput
          autoComplete='current-password'
          capsLockLabel={t('capsLock')}
          id='signin-password'
          {...passwordLabels}
          {...register('password')}
        />
      </FormField>

      <button className={s.forgot} type='button' onClick={onForgotPassword}>
        {t('forgotPassword')}
      </button>

      <SubmitButton isPending={isPending} size='lg'>
        {t('signInAction')}
      </SubmitButton>
    </form>
  );
};
