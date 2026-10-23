'use client';

import { useResizeObserver } from '@siberiacancode/reactuse';

export const useChartWidth = () => {
  const { ref, entries } = useResizeObserver<HTMLDivElement>();

  return { ref, width: Math.floor(entries?.at(-1)?.contentRect.width ?? 0) };
};
