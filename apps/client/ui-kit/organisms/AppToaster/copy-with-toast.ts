import { toast } from 'sonner';

import { writeClipboard } from '@/shared/lib';

import type { CopyWithToastInput } from './AppToaster.types';

export const copyWithToast = async ({ value, success, failure }: CopyWithToastInput): Promise<boolean> => {
  try {
    await writeClipboard(value);
  } catch {
    toast.error(failure);

    return false;
  }

  toast.success(success);

  return true;
};
