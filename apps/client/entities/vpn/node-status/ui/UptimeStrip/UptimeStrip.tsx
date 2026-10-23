'use client';

import type { UptimeDay } from '@gnomevpn/schemas';

import { clsx } from 'clsx';
import { useFormatter, useTranslations } from 'next-intl';
import { useId } from 'react';
import { isNonNullish } from 'remeda';

import { Text } from '@/ui-kit';

import type { UptimeStripProps } from './UptimeStrip.types';

import { uptimeTone } from '../../lib';
import { UPTIME_FORMAT } from './UptimeStrip.constants';

import s from './UptimeStrip.module.scss';

export const UptimeStrip = ({ days, uptime, className }: UptimeStripProps) => {
  const t = useTranslations('status.nodes');
  const format = useFormatter();
  const titleId = useId();
  const summaryId = useId();

  const percent = (value: number) => format.number(value, UPTIME_FORMAT.percent);

  const dayLabel = ({ date, uptime: share }: UptimeDay) => {
    const day = format.dateTime(new Date(date), UPTIME_FORMAT.day);

    return isNonNullish(share) ? t('day', { date: day, percent: percent(share) }) : t('dayUnknown', { date: day });
  };

  const bars = days.map((day) => ({ date: day.date, tone: uptimeTone(day.uptime), label: dayLabel(day), isChecked: isNonNullish(day.uptime) }));
  const checkedDays = bars.filter((bar) => bar.isChecked).length;

  return (
    <div className={clsx(s.root, className)}>
      <div className={s.summary}>
        <Text as='span' id={titleId} size='xs' tone='muted'>
          {t('historyLabel')}
        </Text>

        <Text as='span' id={summaryId} size='sm' weight='semibold'>
          {isNonNullish(uptime) && checkedDays > 0 ? t('uptime', { percent: percent(uptime), days: checkedDays }) : t('uptimeUnknown')}
        </Text>
      </div>

      <ol aria-describedby={summaryId} aria-hidden={checkedDays === 0} aria-labelledby={titleId} className={s.bars}>
        {bars.map((bar) => (
          <li key={bar.date} aria-hidden={!bar.isChecked} className={s.day}>
            <span aria-hidden className={s.bar} data-tone={bar.tone} title={bar.label} />
            <span className={s.label}>{bar.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};
