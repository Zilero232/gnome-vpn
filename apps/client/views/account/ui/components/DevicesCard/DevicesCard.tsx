'use client';

import { useSubscriptionStatus } from '@/entities/billing/subscription';
import { useDevices } from '@/entities/vpn/device';
import { DevicesPanel } from '@/features/account/manage-devices';
import { ExtraDevicesControl } from '@/features/billing/checkout';

import s from './DevicesCard.module.scss';

export const DevicesCard = () => {
  const { subscription, limits } = useSubscriptionStatus();
  const { data: list } = useDevices();

  return (
    <div className={s.root}>
      <DevicesPanel />

      {subscription?.period === 'paid' && <ExtraDevicesControl limits={limits} usedSeats={list?.devices.length ?? 0} />}
    </div>
  );
};
