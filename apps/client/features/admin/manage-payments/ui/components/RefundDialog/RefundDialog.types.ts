import type { AdminPayment } from '@gnomevpn/schemas';

export type RefundDialogProps = {
  payment: AdminPayment | null;
  isOpen: boolean;
  isPending: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
};
