import { clsx } from 'clsx';

import type { StatTileProps } from './StatTile.types';

import { Sparkline, Text } from '../../atoms';

import s from './StatTile.module.scss';

export const StatTile = ({ label, value, hint, trend, className }: StatTileProps) => (
  <div className={clsx(s.root, className)}>
    <Text as='p' className={s.label} size='xs' tone='muted'>
      {label}
    </Text>

    <Text as='p' className={s.value}>
      {value}
    </Text>

    {hint && (
      <Text as='p' size='xs' tone='muted'>
        {hint}
      </Text>
    )}

    {trend && trend.length > 1 && <Sparkline className={s.trend} values={trend} />}
  </div>
);
