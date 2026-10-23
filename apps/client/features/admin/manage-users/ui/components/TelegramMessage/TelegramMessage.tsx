'use client';

import type { AdminMessageInput } from '@gnomevpn/schemas';

import { adminMessageSchema } from '@gnomevpn/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBoolean } from '@siberiacancode/reactuse';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAdminFieldError } from '@/entities/admin/records';
import { messageAdminUser } from '@/shared/api';
import { Button, ConfirmDialog, FormField, Textarea } from '@/ui-kit';

import type { TelegramMessageProps } from './TelegramMessage.types';

import { MESSAGE_FORM } from '../../../config';
import { useUserAction } from '../../../model/hooks';

import s from './TelegramMessage.module.scss';

export const TelegramMessage = ({ userId, className }: TelegramMessageProps) => {
  const t = useTranslations('admin.user.message');
  const common = useTranslations('admin.common');
  const fieldError = useAdminFieldError();
  const id = useId();
  const send = useUserAction(messageAdminUser);

  const [isConfirmOpen, toggleConfirm] = useBoolean(false);

  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    reset
  } = useForm<AdminMessageInput>({ resolver: zodResolver(adminMessageSchema), defaultValues: MESSAGE_FORM.defaults });

  const onSubmit = handleSubmit(() => toggleConfirm(true));

  const onConfirm = () => {
    send.mutate(
      { id: userId, text: getValues('text') },
      {
        onSuccess: ({ outcome }) => {
          toggleConfirm(false);

          if (outcome === 'sent') {
            toast.success(t('outcomes.sent'));
            reset(MESSAGE_FORM.defaults, { keepFieldsRef: true });

            return;
          }

          toast.error(t(`outcomes.${outcome}`));
        }
      }
    );
  };

  return (
    <form noValidate className={clsx(s.root, className)} onSubmit={onSubmit}>
      <FormField error={fieldError(errors.text)} hint={t('hint')} htmlFor={id} label={t('label')}>
        <Textarea id={id} {...register('text')} />
      </FormField>

      <Button className={s.submit} size='md' type='submit' variant='ghost'>
        {t('action')}
      </Button>

      <ConfirmDialog
        cancelLabel={common('cancel')}
        confirmLabel={t('confirm')}
        description={t('body')}
        isOpen={isConfirmOpen}
        isPending={send.isPending}
        title={t('title')}
        tone='primary'
        onConfirm={onConfirm}
        onOpenChange={toggleConfirm}
      />
    </form>
  );
};
