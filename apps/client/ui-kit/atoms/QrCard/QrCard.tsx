import { clsx } from 'clsx';
import { QRCodeSVG } from 'qrcode.react';

import type { QrCardProps } from './QrCard.types';

import { QR_CARD } from './QrCard.constants';

import s from './QrCard.module.scss';

export const QrCard = ({ value, title, className }: QrCardProps) => (
  <div className={clsx(s.root, className)}>
    <QRCodeSVG className={s.svg} level={QR_CARD.level} marginSize={QR_CARD.marginSize} size={QR_CARD.size} title={title} value={value} />
  </div>
);
