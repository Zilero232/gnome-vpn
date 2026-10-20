import type { FaqGroupView } from '../../../lib';

export type UseFaqQueryInput = {
  groups: FaqGroupView[];
};

export type FaqQueryState = {
  query: string;
  topic: string | null;
};
