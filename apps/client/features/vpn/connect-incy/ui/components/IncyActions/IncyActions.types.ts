import type { CopyInput } from '../../IncyCard.types';

export type IncyActionsProps = {
  deepLink: string;
  url: string;
  copiedId: string | null;
  onCopy: (input: CopyInput) => Promise<void>;
  onShowQr: () => void;
};
