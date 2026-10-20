import type { FaqGroupView } from '../../../lib';

export type FaqGroupsProps = {
  groups: FaqGroupView[];
  open: string[];
  onOpenChange: (value: string[]) => void;
};
