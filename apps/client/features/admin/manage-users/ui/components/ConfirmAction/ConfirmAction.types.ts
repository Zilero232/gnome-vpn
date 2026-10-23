import type { ReactNode } from 'react';

import type { ButtonProps } from '@/ui-kit';

export type ConfirmActionProps = {
  label: ReactNode;
  title: ReactNode;
  description: ReactNode;
  confirmLabel: ReactNode;
  isPending: boolean;
  tone?: 'danger' | 'primary';
  variant?: ButtonProps['variant'];
  onConfirm: (close: () => void) => void;
};
