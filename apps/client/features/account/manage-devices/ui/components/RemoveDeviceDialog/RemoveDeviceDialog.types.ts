import type { RemovalKind } from '../../../lib';

export type RemoveDeviceDialogProps = {
  name: string;
  kind: RemovalKind;
  isOpen: boolean;
  isPending: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
};
