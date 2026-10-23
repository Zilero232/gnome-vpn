'use client';

import type { AdminCampaign } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';

import type { DataColumn } from '@/ui-kit';

import { useAdminFormat } from '@/entities/admin/records';
import { Badge, Button } from '@/ui-kit';

import type { UseCampaignColumnsInput } from './CampaignsBlock.types';

import { CAMPAIGN_STATE_TONE } from '../../../config';

export const useCampaignColumns = ({ onStop }: UseCampaignColumnsInput): DataColumn<AdminCampaign>[] => {
  const t = useTranslations('admin.promo.campaigns');
  const format = useAdminFormat();

  return [
    { key: 'code', header: t('columns.code'), isPrimary: true, cell: ({ code }) => <code>{code}</code> },
    {
      key: 'effect',
      header: t('columns.effect'),
      cell: ({ kind, percent, days }) => t(`effect.${kind}`, { percent: percent ?? 0, days: days ?? 0 })
    },
    {
      key: 'used',
      header: t('columns.used'),
      align: 'end',
      cell: ({ used, maxUses }) => (maxUses === null ? format.count(used) : t('usedOf', { used, max: maxUses }))
    },
    { key: 'payments', header: t('columns.payments'), align: 'end', cell: ({ payments }) => format.count(payments) },
    { key: 'revenue', header: t('columns.revenue'), align: 'end', cell: ({ revenue }) => format.money(revenue) },
    { key: 'until', header: t('columns.until'), cell: ({ expiresAt }) => (expiresAt ? format.date(expiresAt) : t('forever')) },
    { key: 'state', header: t('columns.state'), cell: ({ state }) => <Badge tone={CAMPAIGN_STATE_TONE[state]}>{t(`states.${state}`)}</Badge> },
    {
      key: 'action',
      header: t('columns.action'),
      align: 'end',
      cell: (campaign) =>
        campaign.state === 'active' ? (
          <Button size='sm' variant='ghost' onClick={() => onStop(campaign)}>
            {t('stop.action')}
          </Button>
        ) : (
          '—'
        )
    }
  ];
};
