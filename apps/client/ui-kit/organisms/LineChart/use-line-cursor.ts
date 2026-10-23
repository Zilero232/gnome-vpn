'use client';

import type { KeyboardEvent, PointerEvent } from 'react';

import { useState } from 'react';
import { clamp, isNullish } from 'remeda';
import { match } from 'ts-pattern';

import type { UseLineCursorInput } from './LineChart.types';

import { nearestIndex } from '../../molecules';

export const useLineCursor = ({ count, layout }: UseLineCursorInput) => {
  const [active, setActive] = useState<number | null>(null);

  const last = count - 1;

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const from = active ?? last;
    const next = match(event.key)
      .with('ArrowLeft', 'ArrowDown', () => from - 1)
      .with('ArrowRight', 'ArrowUp', () => from + 1)
      .with('Home', () => 0)
      .with('End', () => last)
      .otherwise(() => null);

    if (isNullish(next)) {
      return;
    }

    event.preventDefault();
    setActive(clamp(next, { min: 0, max: last }));
  };

  const onPointerMove = (event: PointerEvent<SVGRectElement>) => {
    if (!layout) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();

    setActive(nearestIndex({ x: layout.box.left + event.clientX - bounds.left, count, start: layout.box.left, end: layout.box.right }));
  };

  return {
    active,
    onKeyDown,
    onPointerMove,
    onFocus: () => setActive((current) => current ?? last),
    onLeave: () => setActive(null)
  };
};
