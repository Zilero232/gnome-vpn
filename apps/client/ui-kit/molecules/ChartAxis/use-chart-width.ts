'use client';

import { useResizeObserver } from '@siberiacancode/reactuse';
import { useState } from 'react';

export const useChartWidth = () => {
  const [width, setWidth] = useState(0);

  const { ref } = useResizeObserver<HTMLDivElement>(([entry]) => setWidth(Math.floor(entry.contentRect.width)));

  return { ref, width };
};
