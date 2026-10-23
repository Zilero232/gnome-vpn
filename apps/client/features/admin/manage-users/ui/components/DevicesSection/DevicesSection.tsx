'use client';

import type { Device } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';

import type { DataColumn } from '@/ui-kit';

import { useAdminFormat } from '@/entities/admin/records';
import { deviceDetails, deviceName } from '@/entities/vpn/device';
import { Badge, DataTable, Text } from '@/ui-kit';

import type { DevicesSectionProps } from './DevicesSection.types';

import { CardSection } from '../CardSection';
import { RemoveDevice } from './components';

export const DevicesSection = ({ userId, devices }: DevicesSectionProps) => {
  const t = useTranslations('admin.user.devices');
  const format = useAdminFormat();

  const nameOf = (device: Device) => deviceName(device) ?? t('unnamed');

  const columns: DataColumn<Device>[] = [
    { key: 'name', header: t('columns.name'), isPrimary: true, cell: (device) => nameOf(device) },
    { key: 'details', header: t('columns.details'), cell: (device) => deviceDetails(device).join(' · ') || '—' },
    { key: 'added', header: t('columns.added'), cell: ({ createdAt }) => format.date(createdAt) },
    { key: 'seen', header: t('columns.seen'), cell: ({ lastSeenAt }) => format.dateTime(lastSeenAt) },
    { key: 'state', header: t('columns.state'), cell: ({ isOverLimit }) => isOverLimit && <Badge tone='warning'>{t('overLimit')}</Badge> },
    {
      key: 'action',
      header: t('columns.action'),
      align: 'end',
      cell: (device) => <RemoveDevice deviceId={device.id} name={nameOf(device)} userId={userId} />
    }
  ];

  return (
    <CardSection description={t('count', { count: devices.devices.length, limit: devices.deviceLimit })} title={t('title')}>
      <DataTable
        empty={
          <Text size='sm' tone='muted'>
            {t('empty')}
          </Text>
        }
        caption={t('title')}
        columns={columns}
        rowKey={(device) => device.id}
        rows={devices.devices}
      />
    </CardSection>
  );
};
