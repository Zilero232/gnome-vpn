'use client';

import { MailCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useToastError } from '@/entities/app/locale';
import { useCurrentUser } from '@/entities/auth/user';
import { ActionBanner } from '@/ui-kit';

import { useResendVerification } from '../../model/hooks';

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
    <ActionBanner
      actionLabel={t('resend')}
      icon={MailCheck}
      isPending={resend.isPending}
      text={t('body', { email })}
      title={t('title')}
      onAction={onResend}
    />
  );
};
