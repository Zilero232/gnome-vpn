'use client';

import { useTranslations } from 'next-intl';
import { sumBy } from 'remeda';

import { useAdminFormat } from '@/entities/admin/records';
import { platformLabel } from '@/entities/vpn/device';
import { BarList, Panel, Text } from '@/ui-kit';

import type { DeviceSharesProps } from './DeviceShares.types';

import { shareItems } from '../../../lib';

import s from './DeviceShares.module.scss';

export const DeviceShares = ({ devicesBy }: DeviceSharesProps) => {
  const t = useTranslations('admin.overview.devices');
  const format = useAdminFormat();

  const labels = { unknown: t('unknown'), other: t('other') };
  const total = sumBy(devicesBy.platform, (share) => share.count);
  const blocks = [
    { key: 'platform', title: t('platform'), items: shareItems({ shares: devicesBy.platform, labels, nameOf: platformLabel }) },
    { key: 'app', title: t('app'), items: shareItems({ shares: devicesBy.app, labels }) }
  ];

  return (
    <div className={s.root}>
      {blocks.map((block) => (
        <Panel key={block.key} caption={t('caption', { total })} title={block.title}>
          {total > 0 ? (
            <BarList formatShare={format.percent} formatValue={format.count} items={block.items} label={block.title} />
          ) : (
            <Text size='sm' tone='muted'>
              {t('empty')}
            </Text>
          )}
        </Panel>
      ))}
    </div>
  );
};
