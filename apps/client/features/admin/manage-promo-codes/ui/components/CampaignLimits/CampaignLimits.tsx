'use client';

import type { AdminCampaignFormValues, AdminCreateCampaign } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { useFormContext } from 'react-hook-form';

import { useAdminFieldError } from '@/entities/admin/records';
import { FormField, Input } from '@/ui-kit';

import { optionalCount } from './CampaignLimits.helpers';

export const CampaignLimits = () => {
  const t = useTranslations('admin.promo.form');
  const fieldError = useAdminFieldError();
  const id = useId();

  const {
    register,
    formState: { errors }
  } = useFormContext<AdminCampaignFormValues, unknown, AdminCreateCampaign>();

  return (
    <>
      <FormField error={fieldError(errors.maxUses)} hint={t('maxUsesHint')} htmlFor={`${id}-uses`} label={t('maxUses')}>
        <Input id={`${id}-uses`} inputMode='numeric' type='number' {...register('maxUses', { setValueAs: optionalCount })} />
      </FormField>

      <FormField error={fieldError(errors.until)} hint={t('untilHint')} htmlFor={`${id}-until`} label={t('until')}>
        <Input id={`${id}-until`} type='date' {...register('until')} />
      </FormField>
    </>
  );
};
