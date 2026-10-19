'use client';

import type { CreateWireguardConfigInput } from '@gnomevpn/schemas';

import { createWireguardConfigSchema } from '@gnomevpn/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useFieldError, useToastError } from '@/entities/app/locale';
import { CountryFlag, FormField, Input, SelectableCard, SubmitButton, Text } from '@/ui-kit';

import type { CreateConfigFormProps } from './CreateConfigForm.types';

import { useCreateWireguardConfig } from '../../../model/hooks';
import { NO_NODE } from './CreateConfigForm.constants';

import s from './CreateConfigForm.module.scss';

export const CreateConfigForm = ({ nodes, isFull, onCreated }: CreateConfigFormProps) => {
  const t = useTranslations('wireguard');
  const fieldError = useFieldError();
  const toastError = useToastError();
  const nameId = useId();
  const countryId = useId();
  const { isPending, mutate } = useCreateWireguardConfig();

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch
  } = useForm<CreateWireguardConfigInput>({
    resolver: zodResolver(createWireguardConfigSchema),
    defaultValues: { nodeId: nodes[0]?.id ?? NO_NODE, name: '' }
  });

  const selected = watch('nodeId');

  const onSubmit = handleSubmit((values) => {
    mutate(values, {
      onSuccess: (file) => {
        toast.success(t('created'));
        reset({ nodeId: values.nodeId, name: '' });
        onCreated(file);
      },
      onError: toastError
    });
  });

  return (
    <form noValidate className={s.root} onSubmit={onSubmit}>
      <Text as='h3' className={s.title} size='sm'>
        {t('createTitle')}
      </Text>

      <div aria-labelledby={countryId} className={s.group} role='radiogroup'>
        <span className={s.groupLabel} id={countryId}>
          {t('countryLabel')}
        </span>

        <div className={s.countryList}>
          {nodes.map((node) => (
            <SelectableCard
              key={node.id}
              aria-checked={selected === node.id}
              className={s.country}
              isSelected={selected === node.id}
              role='radio'
              size='sm'
              type='button'
              onClick={() => setValue('nodeId', node.id, { shouldValidate: true })}
            >
              <CountryFlag countryCode={node.countryCode} size='md' />

              <span className={s.countryText}>
                <span className={s.countryName}>{node.country}</span>
                {node.city && <span className={s.city}>{node.city}</span>}
              </span>
            </SelectableCard>
          ))}
        </div>
      </div>

      <div className={s.row}>
        <FormField hasFloatingError className={s.field} error={fieldError(errors.name)} htmlFor={nameId} label={t('nameLabel')}>
          <Input autoComplete='off' id={nameId} placeholder={t('namePlaceholder')} {...register('name')} />
        </FormField>

        <SubmitButton className={s.submit} disabled={isFull} isPending={isPending} size='lg'>
          <Plus aria-hidden size={18} />
          {t('create')}
        </SubmitButton>
      </div>

      {isFull && (
        <Text as='p' className={s.full} size='sm'>
          {t('full')}
        </Text>
      )}
    </form>
  );
};
