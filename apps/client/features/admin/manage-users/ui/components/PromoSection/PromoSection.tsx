'use client';

import { useTranslations } from 'next-intl';

import { Text } from '@/ui-kit';

import type { PromoSectionProps } from './PromoSection.types';

import { CardSection } from '../CardSection';
import { BoughtGifts, RedemptionTable } from './components';

export const PromoSection = ({ redemptions, gifts }: PromoSectionProps) => {
  const t = useTranslations('admin.user.promo');

  const isEmpty = redemptions.length === 0 && gifts.length === 0;

  return (
    <CardSection title={t('title')}>
      {isEmpty && (
        <Text size='sm' tone='muted'>
          {t('empty')}
        </Text>
      )}

      {redemptions.length > 0 && <RedemptionTable redemptions={redemptions} />}

      {gifts.length > 0 && <BoughtGifts gifts={gifts} />}
    </CardSection>
  );
};
