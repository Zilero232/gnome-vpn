import type { ReactNode } from 'react';

import type { LegalContentsItem } from './components';

export type LegalDocumentProps = {
  title: string;
  updated: string;
  intro: string;
  contents: LegalContentsItem[];
  summary?: ReactNode;
  footnote: ReactNode;
  children: ReactNode;
};
