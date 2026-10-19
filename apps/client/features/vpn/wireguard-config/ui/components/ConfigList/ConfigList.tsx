'use client';

import type { WireguardConfig } from '@gnomevpn/schemas';

import { Download, QrCode, Trash2 } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { DATE_FORMAT } from '@/shared/i18n';
import { Button, ConfirmDialog, CountryFlag, Text } from '@/ui-kit';

import type { ConfigListProps } from './ConfigList.types';

import { downloadConf } from '../../../lib';
import { useRemoveWireguardConfig, useWireguardFile } from '../../../model/hooks';

import s from './ConfigList.module.scss';

export const ConfigList = ({ configs, onShow }: ConfigListProps) => {
  const t = useTranslations('wireguard');
  const format = useFormatter();
  const file = useWireguardFile();
  const remove = useRemoveWireguardConfig();

  const [removing, setRemoving] = useState<WireguardConfig | null>(null);

  const onDownload = (deviceId: string) => {
    file.mutate(deviceId, { onSuccess: downloadConf });
  };

  const onQr = (deviceId: string) => {
    file.mutate(deviceId, { onSuccess: onShow });
  };

  const onRemove = () => {
    if (!removing) {
      return;
    }

    remove.mutate(removing.deviceId, {
      onSuccess: () => toast.success(t('removed')),
      onSettled: () => setRemoving(null)
    });
  };

  return (
    <section className={s.root}>
      <Text as='h3' className={s.title} size='sm'>
        {t('listTitle')}
      </Text>

      {configs.length === 0 ? (
        <Text as='p' size='sm' tone='muted'>
          {t('empty')}
        </Text>
      ) : (
        <ul className={s.list}>
          {configs.map((config) => (
            <li key={config.deviceId} className={s.row}>
              <span className={s.info}>
                <CountryFlag countryCode={config.node.countryCode} size='md' />

                <span className={s.text}>
                  <span className={s.name}>{config.name}</span>
                  <span className={s.meta}>
                    {config.node.country} · {t('createdAt', { date: format.dateTime(new Date(config.createdAt), DATE_FORMAT) })}
                  </span>
                </span>
              </span>

              <span className={s.actions}>
                <Button disabled={file.isPending} size='md' type='button' variant='ghost' onClick={() => onDownload(config.deviceId)}>
                  <Download aria-hidden size={16} />
                  {t('download')}
                </Button>

                <Button disabled={file.isPending} size='md' type='button' variant='ghost' onClick={() => onQr(config.deviceId)}>
                  <QrCode aria-hidden size={16} />
                  {t('qr')}
                </Button>

                <Button aria-label={`${t('remove')}: ${config.name}`} size='icon' type='button' variant='danger' onClick={() => setRemoving(config)}>
                  <Trash2 aria-hidden size={16} />
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        cancelLabel={t('cancel')}
        confirmLabel={t('removeConfirm')}
        description={t('removeDescription')}
        isOpen={removing !== null}
        isPending={remove.isPending}
        title={t('removeTitle', { name: removing?.name ?? '' })}
        tone='danger'
        onConfirm={onRemove}
        onOpenChange={(isOpen) => !isOpen && setRemoving(null)}
      />
    </section>
  );
};
