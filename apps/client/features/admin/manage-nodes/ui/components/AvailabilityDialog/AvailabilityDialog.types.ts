import type { AdminNode } from '@gnomevpn/schemas';

export type AvailabilityDialogProps = {
  node: AdminNode | null;
  name: string;
  isOpen: boolean;
  isPending: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
};
