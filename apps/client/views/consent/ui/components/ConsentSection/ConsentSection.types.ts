import type { ReactNode } from 'react';

import type { ConsentSectionKey } from '../../../config';

export type ConsentSectionProps = {
  section: ConsentSectionKey;
  items: number;
  number: number;
  children?: ReactNode;
};
