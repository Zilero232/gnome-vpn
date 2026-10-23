'use client';

import type { AdminCampaignFormValues, AdminCampaignKind, AdminCreateCampaign } from '@gnomevpn/schemas';

import { CAMPAIGN_KINDS } from '@gnomevpn/schemas';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { useAdminFieldError } from '@/entities/admin/records';
import { FormField, Input, Segmented, Text } from '@/ui-kit';

import { CAMPAIGN_VALUE_RANGE } from '../../../config';

import s from './CampaignFields.module.scss';

export const CampaignFields = () => {
  const t = useTranslations('admin.promo.form');
  const fieldError = useAdminFieldError();
  const id = useId();

  const {
    control,
    register,
    formState: { errors }
  } = useFormContext<AdminCampaignFormValues, unknown, AdminCreateCampaign>();

  const kind = useWatch({ control, name: 'kind' });

  return (
    <>
      <FormField error={fieldError(errors.code)} hint={t('codeHint')} htmlFor={`${id}-code`} label={t('code')}>
        <Input autoCapitalize='characters' autoComplete='off' className={s.code} id={`${id}-code`} spellCheck={false} {...register('code')} />
      </FormField>

      <div className={s.kind}>
        <Text as='span' className={s.kindLabel} weight='semibold'>
          {t('kind')}
        </Text>

        <Controller
          render={({ field }) => (
            <Segmented<AdminCampaignKind>
              aria-label={t('kind')}
              className={s.switch}
              options={CAMPAIGN_KINDS.map((value) => ({ value, label: t(`kinds.${value}`) }))}
              value={field.value}
              onChange={field.onChange}
            />
          )}
          control={control}
          name='kind'
        />

        <Text size='xs' tone='muted'>
          {t(`kindHint.${kind}`)}
        </Text>
      </div>

      <FormField
        error={fieldError(errors.value)}
        hint={t('valueHint', CAMPAIGN_VALUE_RANGE[kind])}
        htmlFor={`${id}-value`}
        label={t(`value.${kind}`)}
      >
        <Input id={`${id}-value`} inputMode='numeric' type='number' {...register('value', { valueAsNumber: true })} />
      </FormField>
    </>
  );
};
