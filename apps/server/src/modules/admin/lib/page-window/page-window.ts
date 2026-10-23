import { clamp } from 'remeda';

import type { PageWindow, PageWindowInput } from './page-window.types';

export const pageWindow = ({ page, total, size }: PageWindowInput): PageWindow => {
  const pages = Math.max(1, Math.ceil(total / size));
  const current = clamp(Math.trunc(page), { min: 1, max: pages });

  return { page: current, pages, pageSize: size, total, skip: (current - 1) * size, take: size };
};
