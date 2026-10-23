import { clsx } from 'clsx';

import type { SparklineProps } from './Sparkline.types';

import { SPARKLINE } from './Sparkline.constants';
import { sparklineGeometry } from './Sparkline.helpers';

import s from './Sparkline.module.scss';

export const Sparkline = ({ values, className }: SparklineProps) => {
  const { path, end } = sparklineGeometry(values);

  return (
    <svg
      aria-hidden
      className={clsx(s.root, className)}
      focusable='false'
      preserveAspectRatio='none'
      viewBox={`0 0 ${SPARKLINE.width} ${SPARKLINE.height}`}
    >
      <path className={s.line} d={path} />

      {end && <path className={s.dot} d={`M${end.x.toFixed(2)},${end.y.toFixed(2)}h0`} />}
    </svg>
  );
};
