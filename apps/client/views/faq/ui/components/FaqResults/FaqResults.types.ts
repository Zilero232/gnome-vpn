import type { FaqHit } from '../../../lib';

export type FaqResultsProps = {
  hits: FaqHit[];
  terms: string[][];
  visible: number;
  open: string[];
  onOpenChange: (value: string[]) => void;
  onShowMore: () => void;
};
