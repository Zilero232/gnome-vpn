'use client';

import { useTranslations } from 'next-intl';

import { SectionHead } from '@/ui-kit';

import { CampaignForm, CampaignsBlock, GiftsBlock } from './components';

import s from './PromoCodesPanel.module.scss';

export const PromoCodesPanel = () => {
  const t = useTranslations('admin.promo');

  return (
    <div className={s.root}>
      <SectionHead description={t('description')} title={t('title')} />

      <CampaignForm />

      <CampaignsBlock />

      <GiftsBlock />
    </div>
  );
};
