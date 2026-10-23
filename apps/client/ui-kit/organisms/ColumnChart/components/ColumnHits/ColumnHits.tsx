'use client';

import type { KeyboardEvent } from 'react';

import { useRef, useState } from 'react';
import { clamp, isNullish } from 'remeda';
import { match } from 'ts-pattern';

import type { ColumnHitsProps } from './ColumnHits.types';

import s from './ColumnHits.module.scss';

export const ColumnHits = ({ points, layout, formatValue, onActive }: ColumnHitsProps) => {
  const hitsRef = useRef<(SVGRectElement | null)[]>([]);

  const [focused, setFocused] = useState(points.length - 1);

  const last = points.length - 1;
  const roving = clamp(focused, { min: 0, max: Math.max(last, 0) });

  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    const next = match(event.key)
      .with('ArrowLeft', 'ArrowDown', () => roving - 1)
      .with('ArrowRight', 'ArrowUp', () => roving + 1)
      .with('Home', () => 0)
      .with('End', () => last)
      .otherwise(() => null);

    if (isNullish(next)) {
      return;
    }

    event.preventDefault();
    hitsRef.current[clamp(next, { min: 0, max: last })]?.focus();
  };

  return (
    <g onKeyDown={onKeyDown} onPointerLeave={() => onActive(null)}>
      {points.map((point, index) => (
        <rect
          key={point.key}
          ref={(node) => {
            hitsRef.current[index] = node;
          }}
          aria-label={`${point.label}: ${formatValue(point.value)}`}
          className={s.hit}
          height={layout.box.bottom - layout.box.top}
          role='img'
          tabIndex={index === roving ? 0 : -1}
          width={layout.band}
          x={layout.box.left + index * layout.band}
          y={layout.box.top}
          onBlur={() => onActive(null)}
          onFocus={() => {
            setFocused(index);
            onActive(index);
          }}
          onPointerEnter={() => onActive(index)}
        />
      ))}
    </g>
  );
};
