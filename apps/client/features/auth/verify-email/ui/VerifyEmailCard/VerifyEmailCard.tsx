'use client';

import { MailCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useToastError } from '@/entities/app/locale';
import { useCurrentUser } from '@/entities/auth/user';
import { SubmitButton, Text } from '@/ui-kit';

import { useResendVerification } from '../../model/hooks';

import s from './VerifyEmailCard.module.scss';

export const VerifyEmailCard = () => {
  const t = useTranslations('auth.verifyPrompt');
  const toastError = useToastError();
  const { email } = useCurrentUser();
  const resend = useResendVerification();

  const onResend = () => {
    resend.mutate(email, {
      onSuccess: () => toast.success(t('sent')),
      onError: toastError
    });
  };

  return (
    <div className={s.root}>
      <span aria-hidden className={s.icon}>
        <MailCheck size={22} />
      </span>

      <div className={s.body}>
        <Text as='h2' className={s.title}>
          {t('title')}
        </Text>

        <Text as='p' className={s.text}>
          {t('body', { email })}
        </Text>
      </div>

      <SubmitButton className={s.action} isPending={resend.isPending} size='md' type='button' onClick={onResend}>
        {t('resend')}
      </SubmitButton>
    </div>
  );
};
