'use client';

import { Download, QrCode, Trash2 } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';

import { useCountryName } from '@/entities/app/country';
import { DATE_FORMAT } from '@/shared/i18n';
import { Button, CountryFlag } from '@/ui-kit';

import type { ConfigRowProps } from './ConfigRow.types';

import s from './ConfigRow.module.scss';

export const ConfigRow = ({ config, isBusy, onDownload, onQr, onRemove }: ConfigRowProps) => {
  const t = useTranslations('wireguard');
  const format = useFormatter();
  const countryName = useCountryName();

  return (
    <li className={s.root}>
      <span className={s.info}>
        <CountryFlag countryCode={config.node.countryCode} size='md' />

        <span className={s.text}>
          <span className={s.name}>{config.name}</span>
          <span className={s.meta}>
            {countryName(config.node)} · {t('createdAt', { date: format.dateTime(new Date(config.createdAt), DATE_FORMAT) })}
          </span>
          {config.node.isDown && <span className={s.down}>{t('configServerDown')}</span>}
        </span>
      </span>

      <span className={s.actions}>
        <Button className={s.action} disabled={isBusy} size='md' type='button' variant='ghost' onClick={onDownload}>
          <Download aria-hidden size={16} />
          {t('download')}
        </Button>

        <Button className={s.action} disabled={isBusy} size='md' type='button' variant='ghost' onClick={onQr}>
          <QrCode aria-hidden size={16} />
          {t('qr')}
        </Button>
      </span>

      <Button aria-label={`${t('remove')}: ${config.name}`} className={s.remove} size='icon' type='button' variant='ghost' onClick={onRemove}>
        <Trash2 aria-hidden size={16} />
      </Button>
    </li>
  );
};
