'use client';

import type { WireguardConfig } from '@gnomevpn/schemas';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { downloadFile } from '@/shared/lib';
import { ConfirmDialog, Text } from '@/ui-kit';

import type { ConfigListProps } from './ConfigList.types';

import { useRemoveWireguardConfig, useWireguardFile } from '../../../model/hooks';
import { ConfigRow } from './components';

import s from './ConfigList.module.scss';

export const ConfigList = ({ configs, onShow }: ConfigListProps) => {
  const t = useTranslations('wireguard');
  const file = useWireguardFile();
  const remove = useRemoveWireguardConfig();

  const [removing, setRemoving] = useState<WireguardConfig | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const onDownload = (deviceId: string) => {
    file.mutate(deviceId, { onSuccess: ({ filename, conf }) => downloadFile({ filename, content: conf }) });
  };

  const onQr = (deviceId: string) => {
    file.mutate(deviceId, { onSuccess: onShow });
  };

  const askRemove = (config: WireguardConfig) => {
    setRemoving(config);
    setIsConfirmOpen(true);
  };

  const onRemove = () => {
    if (!removing) {
      return;
    }

    remove.mutate(removing.deviceId, { onSettled: () => setIsConfirmOpen(false) });
  };

  return (
    <section className={s.root}>
      <Text as='h3' className={s.title} size='sm'>
        {t('listTitle')}
      </Text>

      <ul className={s.list}>
        {configs.map((config) => (
          <ConfigRow
            key={config.deviceId}
            config={config}
            isBusy={file.isPending}
            onDownload={() => onDownload(config.deviceId)}
            onQr={() => onQr(config.deviceId)}
            onRemove={() => askRemove(config)}
          />
        ))}
      </ul>

      <ConfirmDialog
        cancelLabel={t('cancel')}
        confirmLabel={t('removeConfirm')}
        description={t('removeDescription')}
        isOpen={isConfirmOpen}
        isPending={remove.isPending}
        title={t('removeTitle', { name: removing?.name ?? '' })}
        tone='danger'
        onConfirm={onRemove}
        onOpenChange={setIsConfirmOpen}
        onOpenChangeComplete={(isOpen) => !isOpen && setRemoving(null)}
      />
    </section>
  );
};
