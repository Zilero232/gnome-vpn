'use client';

import type { CreateWireguardConfigInput } from '@gnomevpn/schemas';

import { createWireguardConfigSchema, WIREGUARD_CONFIG_NAME } from '@gnomevpn/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { useForm } from 'react-hook-form';

import { useFieldError, useToastError } from '@/entities/app/locale';
import { useSubscriptionStatus } from '@/entities/billing/subscription';
import { celebrate, FormField, Input, SubmitButton, Text } from '@/ui-kit';

import type { CreateConfigFormProps } from './CreateConfigForm.types';

import { useCreateWireguardConfig } from '../../../model/hooks';
import { CountryPicker } from './components';
import { NO_NODE } from './CreateConfigForm.constants';

import s from './CreateConfigForm.module.scss';

export const CreateConfigForm = ({ nodes, isFull, onCreated }: CreateConfigFormProps) => {
  const t = useTranslations('wireguard');
  const fieldError = useFieldError();
  const toastError = useToastError();
  const nameId = useId();
  const { isPending, mutate } = useCreateWireguardConfig();
  const { subscription } = useSubscriptionStatus();

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch
  } = useForm<CreateWireguardConfigInput>({
    resolver: zodResolver(createWireguardConfigSchema),
    defaultValues: { nodeId: nodes.find((node) => !node.isDown)?.id ?? NO_NODE, name: '' }
  });

  const selected = watch('nodeId');
  const isSelectedDown = nodes.find((node) => node.id === selected)?.isDown ?? true;

  const onSubmit = handleSubmit((values) => {
    mutate(values, {
      onSuccess: (file) => {
        celebrate(t('created'));
        reset({ nodeId: values.nodeId, name: '' });
        onCreated(file);
      },
      onError: toastError
    });
  });

  return (
    <form noValidate className={s.root} onSubmit={onSubmit}>
      <CountryPicker nodes={nodes} selected={selected} onSelect={(nodeId) => setValue('nodeId', nodeId, { shouldValidate: true })} />

      <div className={s.row}>
        <FormField className={s.field} error={fieldError(errors.name)} htmlFor={nameId} label={t('nameLabel')}>
          <Input
            autoComplete='off'
            id={nameId}
            maxLength={WIREGUARD_CONFIG_NAME.maxLength}
            placeholder={t('namePlaceholder')}
            {...register('name')}
          />
        </FormField>

        <SubmitButton className={s.submit} disabled={isFull || isSelectedDown} isPending={isPending} size='lg'>
          <Plus aria-hidden size={18} />
          {t('create')}
        </SubmitButton>
      </div>

      {isFull && (
        <Text as='p' className={s.full} size='sm'>
          {subscription?.period === 'trial' ? t('fullTrial') : t('full')}
        </Text>
      )}

      {!isFull && nodes.every((node) => node.isDown) && (
        <Text as='p' className={s.full} size='sm'>
          {t('allDown')}
        </Text>
      )}
    </form>
  );
};
