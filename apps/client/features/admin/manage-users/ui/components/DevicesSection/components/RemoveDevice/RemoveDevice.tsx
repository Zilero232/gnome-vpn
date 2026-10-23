'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { removeAdminDevice } from '@/shared/api';

import type { RemoveDeviceProps } from './RemoveDevice.types';

import { useUserAction } from '../../../../../model/hooks';
import { ConfirmAction } from '../../../ConfirmAction';

export const RemoveDevice = ({ userId, deviceId, name }: RemoveDeviceProps) => {
  const t = useTranslations('admin.user.devices.remove');
  const remove = useUserAction(removeAdminDevice);

  return (
    <ConfirmAction
      confirmLabel={t('confirm')}
      description={t('body')}
      isPending={remove.isPending}
      label={t('action')}
      title={t('title', { name })}
      tone='danger'
      onConfirm={(close) =>
        remove.mutate(
          { id: userId, deviceId },
          {
            onSuccess: () => {
              close();
              toast.success(t('done'));
            }
          }
        )
      }
    />
  );
};
