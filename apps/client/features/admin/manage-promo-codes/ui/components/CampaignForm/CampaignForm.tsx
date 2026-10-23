'use client';

import type { AdminCampaignFormValues, AdminCreateCampaign } from '@gnomevpn/schemas';

import { adminCampaignFormSchema } from '@gnomevpn/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { SectionHead, SubmitButton } from '@/ui-kit';

import { CAMPAIGN_FORM } from '../../../config';
import { useCreateCampaign } from '../../../model/hooks';
import { CampaignFields } from '../CampaignFields';
import { CampaignLimits } from '../CampaignLimits';

import s from './CampaignForm.module.scss';

export const CampaignForm = () => {
  const t = useTranslations('admin.promo.form');
  const create = useCreateCampaign();

  const form = useForm<AdminCampaignFormValues, unknown, AdminCreateCampaign>({
    resolver: zodResolver(adminCampaignFormSchema),
    defaultValues: CAMPAIGN_FORM.defaults
  });

  const onSubmit = form.handleSubmit((values) => {
    create.mutate(values, {
      onSuccess: (campaign) => {
        toast.success(t('created', { code: campaign.code }));
        form.reset(CAMPAIGN_FORM.defaults, { keepFieldsRef: true });
      }
    });
  });

  return (
    <FormProvider {...form}>
      <form noValidate className={s.root} onSubmit={onSubmit}>
        <SectionHead description={t('description')} level='h3' title={t('title')} />

        <div className={s.grid}>
          <CampaignFields />
          <CampaignLimits />

          <div>
            <SubmitButton className={s.submit} isPending={create.isPending} size='md'>
              {t('submit')}
            </SubmitButton>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
