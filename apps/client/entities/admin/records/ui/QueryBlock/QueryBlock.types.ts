import type { ReactNode } from 'react';

export type QueryBlockProps<Data> = {
  data: Data | undefined;
  isPending: boolean;
  isRetrying: boolean;
  onRetry: () => void;
  children: (data: Data) => ReactNode;
};
