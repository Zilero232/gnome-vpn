'use client';

import type { AdminExtendInput } from '@gnomevpn/schemas';

import { adminExtendSchema } from '@gnomevpn/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAdminFieldError, useAdminFormat } from '@/entities/admin/records';
import { extendAdminUser } from '@/shared/api';
import { Button, ConfirmDialog, FormField, Input } from '@/ui-kit';

import type { ExtendFormProps, PendingExtension } from './ExtendForm.types';

import { EXTEND_FORM } from '../../../config';
import { projectedEnd } from '../../../lib';
import { useUserAction } from '../../../model/hooks';

import s from './ExtendForm.module.scss';

export const ExtendForm = ({ userId, currentPeriodEnd }: ExtendFormProps) => {
  const t = useTranslations('admin.user.extend');
  const common = useTranslations('admin.common');
  const fieldError = useAdminFieldError();
  const format = useAdminFormat();
  const id = useId();
  const extend = useUserAction(extendAdminUser);

  const [pending, setPending] = useState<PendingExtension | null>(null);

  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<AdminExtendInput>({ resolver: zodResolver(adminExtendSchema), defaultValues: EXTEND_FORM.defaults });

  const onSubmit = handleSubmit(({ days }) => setPending({ days, end: projectedEnd({ currentPeriodEnd, days, now: new Date() }) }));

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setPending(null);
    }
  };

  const onConfirm = () => {
    if (!pending) {
      return;
    }

    extend.mutate(
      { id: userId, days: pending.days },
      {
        onSuccess: (result) => {
          setPending(null);
          toast.success(t('done', { date: format.dateTime(result.currentPeriodEnd) }));
        }
      }
    );
  };

  return (
    <form noValidate className={s.root} onSubmit={onSubmit}>
      <FormField className={s.field} error={fieldError(errors.days)} htmlFor={id} label={t('label')}>
        <Input id={id} inputMode='numeric' type='number' {...register('days', { valueAsNumber: true })} />
      </FormField>

      <Button className={s.submit} size='md' type='submit' variant='ghost'>
        {t('action')}
      </Button>

      <ConfirmDialog
        cancelLabel={common('cancel')}
        confirmLabel={t('confirm')}
        description={t('body', { date: pending ? format.dateTime(pending.end.toISOString()) : '' })}
        isOpen={pending !== null}
        isPending={extend.isPending}
        title={t('title', { days: pending?.days ?? 0 })}
        tone='primary'
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />
    </form>
  );
};
