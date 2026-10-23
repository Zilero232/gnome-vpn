export type StopDialogProps = {
  code: string;
  isOpen: boolean;
  isPending: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
};
