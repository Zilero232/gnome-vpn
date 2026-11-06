'use client';

import { useTranslations } from 'next-intl';
import { isNullish } from 'remeda';

import { useAdminFormat } from '@/entities/admin/records';

import type { LoadCell, NodeLoadProps } from './NodeLoad.types';

import { peakSummary } from '../../../../../lib';

import s from './NodeLoad.module.scss';

export const NodeLoad = ({ node }: NodeLoadProps) => {
  const t = useTranslations('admin.nodes.load');
  const format = useAdminFormat();

  const { online, peaks } = node;
  const { today, best } = peakSummary(peaks);

  const none = t('none');
  const noData = t('noData');
  const count = (value?: number | null) => (isNullish(value) ? none : format.count(value));
  const percent = (value?: number | null) => (isNullish(value) ? none : format.percent(value / 100));

  const cells: LoadCell[] = [
    {
      key: 'now',
      label: t('now'),
      value: count(online?.clients),
      hint: online ? t('users', { count: online.users }) : noData
    },
    {
      key: 'today',
      label: t('today'),
      value: count(today?.clients),
      hint: today?.clientsAt ? t('at', { time: format.time(today.clientsAt) }) : noData
    },
    {
      key: 'best',
      label: t('best', { days: peaks.length }),
      value: count(best?.clients),
      hint: best?.clientsAt ? t('on', { date: format.day(best.date), time: format.time(best.clientsAt) }) : noData
    },
    {
      key: 'resources',
      label: t('resources'),
      value: percent(today?.cpu),
      hint: isNullish(today?.memory) ? noData : t('memory', { value: format.percent(today.memory / 100) })
    }
  ];

  return (
    <dl className={s.root}>
      {cells.map((cell) => (
        <div key={cell.key} className={s.cell}>
          <dt className={s.label}>{cell.label}</dt>
          <dd className={s.value}>{cell.value}</dd>
          <dd className={s.hint}>{cell.hint}</dd>
        </div>
      ))}
    </dl>
  );
};
