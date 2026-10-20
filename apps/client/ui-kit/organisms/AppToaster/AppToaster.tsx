'use client';

import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';

import { ACTION_SELECTOR, TOAST_GAP, TOAST_OFFSET, TOAST_OPTIONS, TOAST_SELECTOR } from './AppToaster.constants';

export const AppToaster = () => {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target?.closest(TOAST_SELECTOR) || target.closest(ACTION_SELECTOR)) {
        return;
      }

      toast.dismiss();
    };

    document.addEventListener('click', onClick);

    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <Toaster
      className='gnomevpn-toaster'
      gap={TOAST_GAP}
      mobileOffset={TOAST_OFFSET.mobile}
      offset={TOAST_OFFSET.desktop}
      position='bottom-right'
      theme='light'
      toastOptions={TOAST_OPTIONS}
    />
  );
};
