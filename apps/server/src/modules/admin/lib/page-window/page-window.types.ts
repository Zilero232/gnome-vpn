import type { AdminPageInfo } from '@gnomevpn/schemas';

export type PageWindowInput = {
  page: number;
  total: number;
  size: number;
};

export type PageWindow = AdminPageInfo & {
  skip: number;
  take: number;
};
